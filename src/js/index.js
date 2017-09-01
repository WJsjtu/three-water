import * as THREE from 'three';

import {default as WaterInfo} from './model/water';
import {default as CausticsInfo} from './model/caustics';
import waterShader from './shader/waterShader';
import cubeShader from './shader/cubeShader';
import './utils/OpenBoxBufferGeometry';
import './libs/OrbitControls';

class App {
	constructor(canvas, _waterWidth = 128.0, _waterHeight = 128.0, _poolHeight = 60) {
		this.renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true
		});
		const width = canvas.width, height = canvas.height;
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(width, height);
		this.renderer.autoClear = false;


		this.textureLoaded = false;
		this.waterWidth = _waterWidth;
		this.waterHeight = _waterHeight;
		this.poolHeight = _poolHeight;

		this.waterInfo = new WaterInfo(
			this.renderer,
			this.waterWidth,
			this.waterHeight,
			false
		);

		this.causticsInfo = new CausticsInfo(
			this.renderer,
			4 * this.waterWidth,
			4 * this.waterHeight,
			false
		);

		if (this.waterInfo.debug === true || this.causticsInfo.debug === true) {
			this.renderer.setSize(this.waterWidth * 2, this.waterHeight * 2);
		}

		//
		this.lightDiection = (new THREE.Vector3(-0.6569324541223192, -0.48372520523599466, -0.5839062558994448)).normalize();

		// real scene
		this.scene = new THREE.Scene();
		this.scene.matrixAutoUpdate = false;


		// camera
		this.camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 10000000);
		this.camera.position.z = 280;
		this.camera.position.y = 100;


		// controls
		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.25;
		this.controls.enableZoom = true;

		this.scene.add(new THREE.AmbientLight(0x444444));

		const light = new THREE.DirectionalLight(0xffffbb, 1);
		light.position.set(this.lightDiection.x, this.lightDiection.y, this.lightDiection.z);
		this.scene.add(light);

		// skyTexture
		const skyTexturePromise = new Promise((resolve) => {
			const urls = 'px nx py ny pz nz'.split(' ').map(face => {
				return `./img/skybox/${face}.jpg`;
			});
			new THREE.CubeTextureLoader().load(urls, (skyTexture) => {
				skyTexture.format = THREE.RGBFormat;
				resolve(skyTexture);
			});
		});

		// tileTexture
		const tileTexturePromise = new Promise((resolve) => {
			new THREE.TextureLoader().load('./img/tile.jpg', (tileTexture) => {
				tileTexture.format = THREE.RGBFormat;
				resolve(tileTexture);
			});
		});

		Promise.all([skyTexturePromise, tileTexturePromise]).then((textures) => {

			console.log('textures loaded', textures);

			const skyTexture = textures[0], tileTexture = textures[1];

			const skyCubeShader = THREE.ShaderLib['cube'];
			skyCubeShader.uniforms['tCube'].value = skyTexture;

			const skyBoxMaterial = new THREE.ShaderMaterial({
				fragmentShader: skyCubeShader.fragmentShader,
				vertexShader: skyCubeShader.vertexShader,
				uniforms: skyCubeShader.uniforms,
				depthWrite: false,
				side: THREE.BackSide
			});

			const skyBox = new THREE.Mesh(
				new THREE.BoxGeometry(1000000, 1000000, 1000000),
				skyBoxMaterial
			);

			this.scene.add(skyBox);

			// water surface
			this.waterMaterials = waterShader.map((shader, index) => {
				shader.uniforms.u_TileTexture.value = tileTexture;
				shader.uniforms.u_SkyTexture.value = skyTexture;
				shader.uniforms.u_WaterWidth.value = this.waterWidth;
				shader.uniforms.u_WaterHeight.value = this.waterHeight;
				const material = new THREE.ShaderMaterial(shader);
				material.side = [THREE.FrontSide, THREE.BackSide][index];//above water, *under water
				return material;
			});

			const waterPlane = new THREE.PlaneGeometry(this.waterWidth, this.waterHeight);

			this.waterMeshes = this.waterMaterials.map(material => {
				const mesh = new THREE.Mesh(waterPlane, material);
				mesh.rotation.x = 3 / 2 * Math.PI; // front to top, back to bottom
				this.scene.add(mesh);
				return mesh;
			});


			// water cube
			cubeShader.uniforms.u_TileTexture.value = tileTexture;
			cubeShader.uniforms.u_WaterWidth.value = this.waterWidth;
			cubeShader.uniforms.u_WaterHeight.value = this.waterHeight;
			this.cubeMaterial = new THREE.ShaderMaterial(cubeShader);
			this.cubeMaterial.transparent = true;

			const cubeMesh = new THREE.Mesh(new THREE.OpenBoxBufferGeometry(this.waterWidth, 1, this.waterHeight), this.cubeMaterial);
			cubeMesh.position.y = -0.5;

			this.scene.add(cubeMesh);

			// init drops
			this.addRandomDrops();
			this.textureLoaded = true;

		});

		// raycaster
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this), true);

		this.render = this.render.bind(this);
	}

	addDrop(center, radius, strength) {
		this.waterInfo.addDrop(center, radius, strength);
	}

	addRandomDrops() {
		const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min;
		for (let i = 0; i < 10; i++) {
			// params: center, radius in uv coord, strength [0, 1]
			this.addDrop(new THREE.Vector2(getRandomArbitrary(0.0, 0.5), getRandomArbitrary(0.0, 0.5)), 0.1, (i & 1) ? -0.1 : 0.1);
		}
	}

	render() {
		requestAnimationFrame(this.render);
		this.controls.update();
		this.textureLoaded && this.update();
	}

	update() {

		this.renderer.clear();

		// waterInfoTexture
		this.waterInfoTexture = this.waterInfo.render();


		// causticTex
		this.causticsInfo.pCaustics.updateUniform('u_LightDir', this.lightDiection);
		this.causticsInfo.pCaustics.updateUniform('u_PoolHeight', this.poolHeight);
		this.causticTex = this.causticsInfo.render(this.waterInfoTexture);


		// water surface
		for (let i = 0; i < 2; i++) {
			this.waterMaterials[i].uniforms['u_WaterInfoTexture'].value = this.waterInfoTexture;
			this.waterMaterials[i].uniforms['u_CausticTex'].value = this.causticTex;
			this.waterMaterials[i].uniforms['u_LightDir'].value = this.lightDiection;
			this.waterMaterials[i].uniforms['u_PoolHeight'].value = this.poolHeight;
		}

		// water cube
		this.cubeMaterial.uniforms['u_WaterInfoTexture'].value = this.waterInfoTexture;
		this.cubeMaterial.uniforms['u_CausticTex'].value = this.causticTex;
		this.cubeMaterial.uniforms['u_LightDir'].value = this.lightDiection;
		this.cubeMaterial.uniforms['u_PoolHeight'].value = this.poolHeight;

		// real scene
		this.renderer.render(this.scene, this.camera);
	}

	onMouseClick(event) {

		const rect = this.renderer.domElement.getBoundingClientRect();
		const canvasOffsetX = rect.left, canvasOffsetY = rect.top;

		this.mouse.x = ((event.clientX - canvasOffsetX) / this.renderer.domElement.width * window.devicePixelRatio) * 2 - 1;
		this.mouse.y = -((event.clientY - canvasOffsetY) / this.renderer.domElement.height * window.devicePixelRatio) * 2 + 1;
		
		this.raycaster.setFromCamera(this.mouse, this.camera);

		const intersects0 = this.raycaster.intersectObject(this.waterMeshes[0]),
			intersects1 = this.raycaster.intersectObject(this.waterMeshes[1]);

		if (intersects0.length <= 0 && intersects1.length <= 0) return;

		if (!intersects0[intersects0.length > 0 ? 0 : 1]) return;

		const point = intersects0[intersects0.length > 0 ? 0 : 1].point; // world position

		const center = new THREE.Vector2((point.x + this.waterWidth / 2) / this.waterWidth, (-point.z + this.waterHeight / 2) / this.waterHeight); // uv

		for (let i = 0; i < 2; i++) {
			this.addDrop(center, 0.1, (i & 1) ? -0.2 : 0.2);
		}
	}
}

window.App = App;
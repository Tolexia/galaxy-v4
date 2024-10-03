import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import particlesVertexShader from './shaders/vertex.glsl'
import particlesFragmentShader from './shaders/fragment.glsl'
import { gaussianRandom, spiral } from './utils.js';
import GUI from 'lil-gui'
import { ARMS, ARM_X_DIST, ARM_X_MEAN, ARM_Y_DIST, ARM_Y_MEAN, CORE_X_DIST, CORE_Y_DIST, GALAXY_THICKNESS, OUTER_CORE_X_DIST, OUTER_CORE_Y_DIST } from './config/galaxyConfig.js';
import { EffectComposer, RenderPass, ShaderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
// scene.add( new THREE.AmbientLight( 0xcccccc  ) );
// scene.fog = new THREE.FogExp2(0xEBE2DB, 0.00003);


// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    particlesMaterial.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)

    // Update effect composer
    effectComposer.setSize(sizes.width, sizes.height)
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 5000000)
camera.position.set(0, 650, 650);
camera.up.set(0, 0, 2);
camera.lookAt(0, 0, 0);
scene.add(camera)

// const pointLight = new THREE.PointLight( 0xffffff, 1 );
// camera.add( pointLight );

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor('#181818')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)


/**
 * Particles
 */
const parameters = {}
parameters.count = 25000
parameters.size = 1
parameters.radius = 10
parameters.branches = 2
parameters.spin = 1.5
parameters.randomness = 3
parameters.randomnessPower = 1.7
parameters.insideColor = '#eb3700'
parameters.outsideColor = '#99edf7'

let 
    positions,
    particlesSizes ,
    vertices
 /**
     * Geometry
     */
 const particlesGeometry = new THREE.BufferGeometry()
    
 const positionsTmp = []

 
 particlesSizes = new Float32Array( parameters.count );
 vertices = new Array();

 for(let i = 0; i < parameters.count / 4 ; i++)
 {
     let x = gaussianRandom(0, CORE_X_DIST)
     let y = gaussianRandom(0, CORE_Y_DIST)
     let z = gaussianRandom(0, GALAXY_THICKNESS)
     positionsTmp.push( x )
     positionsTmp.push( y )
     positionsTmp.push( z )
     vertices.push(new THREE.Vector3(x, y, z))
 }
 for(let i = 0; i < parameters.count / 4 ; i++)
 {
     let x = gaussianRandom(0, OUTER_CORE_X_DIST)
     let y = gaussianRandom(0, OUTER_CORE_Y_DIST)
     let z = gaussianRandom(0, GALAXY_THICKNESS)
     positionsTmp.push(x)
     positionsTmp.push(y)
     positionsTmp.push(z)
     vertices.push(new THREE.Vector3(x, y, z))
 }
 for (let j = 0; j < ARMS; j++) {
    for ( let i = 0; i < parameters.count / 4; i++){
        let pos = spiral(gaussianRandom(ARM_X_MEAN, ARM_X_DIST), gaussianRandom(ARM_Y_MEAN, ARM_Y_DIST), gaussianRandom(0, GALAXY_THICKNESS), j * 2 * Math.PI / ARMS)
        positionsTmp.push(pos.x) 
        positionsTmp.push(pos.y) 
        positionsTmp.push(pos.z) 
        vertices.push(new THREE.Vector3(pos.x, pos.y, pos.z))
    }
 }
 positions = new Float32Array(positionsTmp.length)
 const aRandom = new Float32Array( positionsTmp.length );

 const colors = new Float32Array(parameters.count * 3)
 const insideColor = new THREE.Color(parameters.insideColor)
 const outsideColor = new THREE.Color(parameters.outsideColor)
 
 for ( let i = 0; i < positionsTmp.length; i++)
 {
    // Position
    positions[i] = positionsTmp[i];

    // Size
    particlesSizes[i] = parameters.size * (Math.random() + 0.5);
 }
 for ( let i = 0; i < positionsTmp.length / 3; i++)
{
    const i3 = i * 3
        
    const spherical = new THREE.Spherical(
        (0.75 + Math.random() * 0.25),
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
    )

    const position = new THREE.Vector3()
    
    position.setFromSpherical(spherical)

    aRandom[i3    ] = position.x;
    aRandom[i3 + 1] = position.y;
    aRandom[i3 + 2] = position.z;

     // Color
     const mixedColor = insideColor.clone()
     const pos = new THREE.Vector3(positions[i3],positions[i3+1],positions[i3+2])
     mixedColor.lerp(outsideColor, pos.distanceTo(new THREE.Vector3(0,0,0))/ 1.5 / OUTER_CORE_X_DIST)

     colors[i3    ] = mixedColor.r
     colors[i3 + 1] = mixedColor.g
     colors[i3 + 2] = mixedColor.b
}

particlesGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute(positions, 3) )
particlesGeometry.setAttribute( 'aRandom', new THREE.Float32BufferAttribute(aRandom, 3) )
particlesGeometry.setAttribute( 'aColor', new THREE.BufferAttribute( colors, 3 ) );
particlesGeometry.setAttribute( 'size', new THREE.BufferAttribute( particlesSizes, 1 ) );
// particlesGeometry.setIndex(null)
// particlesGeometry.deleteAttribute('normal')

const intensitiesArray = new Float32Array(particlesGeometry.attributes.position.count)
const anglesArray = new Float32Array(particlesGeometry.attributes.position.count)

for(let i = 0; i < particlesGeometry.attributes.position.count; i++)
{
    intensitiesArray[i] = Math.random()
    anglesArray[i] = Math.random()* Math.PI * 2
}

particlesGeometry.setAttribute('aIntensity', new THREE.BufferAttribute(intensitiesArray, 1))
particlesGeometry.setAttribute('aAngle', new THREE.BufferAttribute(anglesArray, 1))

const tweaks = {
    particleSize : 1.0
}

// Raycaster
const raycaster = new THREE.Raycaster()

const pointer = {}

const point = new THREE.Vector3(0,0,0)

const test = new THREE.Mesh(
    new THREE.SphereGeometry(10, 10,10),
    new THREE.MeshBasicMaterial({color:0xFF0000, wireframe:true})
)
// scene.add(test)
document.querySelector('canvas')?.addEventListener('mousemove', event =>
{
    pointer.x = (event.x / sizes.width) * 2 - 1
    pointer.y = - (event.y / sizes.height) * 2 + 1

    raycaster.setFromCamera(pointer, camera)

    const intersects = raycaster.intersectObject(particles)
    if(intersects.length > 0)
    {
        test.position.lerp(intersects[0].point, 0.2)
        point.lerp(intersects[0].point, 0.5)
    }
})
document.querySelector('canvas')?.addEventListener('touchmove', e => {
    const clientX = event.changedTouches[0].clientX
    const clientY = event.changedTouches[0].clientY

    pointer.x = (clientX / sizes.width) * 2 - 1
    pointer.y = - (clientY / sizes.height) * 2 + 1

    raycaster.setFromCamera(pointer, camera)

    const intersects = raycaster.intersectObject(particles)
    if(intersects.length > 0)
    {
        test.position.lerp(intersects[0].point, 0.2)
        point.lerp(intersects[0].point, 0.5)
    }
})

let glowPath = '/glow.png'
if( window.location.href.includes("github") ) glowPath = "."+glowPath

const particlesMaterial = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms:
    {
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uParticleSize:  new THREE.Uniform(tweaks.particleSize),
        uPointer: new THREE.Uniform(point),
        PI: new THREE.Uniform(Math.PI),
        uTime: new THREE.Uniform(0),
        uTexture: new THREE.Uniform(textureLoader.load(glowPath))
    }
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const gui = new GUI;
gui.hide()
gui 
    .add(tweaks, 'particleSize')
    .min(0.001)
    .max(1)
    .step(0.01)


    /**
 * Post processing
 */
renderer.outputEncoding = THREE.sRGBEncoding
parameters.toneMappingExposure =0.01
renderer.toneMappingExposure = Math.pow(parameters.toneMappingExposure, 4.0 )
renderer.toneMapping = THREE.ReinhardToneMapping;

const renderTarget = new THREE.WebGLRenderTarget(
    800,
    600,
    {
        // antialias: true,
        // logarithmicDepthBuffer: true,
        samples: renderer.getPixelRatio() === 1 ? 2 : 0
    }
)
const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setSize(sizes.width, sizes.height)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

const unrealBloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.5, 0.1, 0.85 )
// unrealBloomPass.enabled = false
unrealBloomPass.strength = 1.18
unrealBloomPass.radius = 0.037
unrealBloomPass.threshold = 0.222

gui.add(unrealBloomPass, 'enabled')
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'radius').min(0).max(1).step(0.0001)
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)
gui.add(parameters, 'toneMappingExposure').min(0).max(5).step(0.001).onChange( function ( value ) {

    renderer.toneMappingExposure = Math.pow( value, 4.0 );

} );

effectComposer.addPass(unrealBloomPass)

const TintShader = {
    uniforms:
    {
        tDiffuse: { value: null },
        uTint: { value: null }
    },
    vertexShader: `
        varying vec2 vUv;

        void main()
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 uTint;

        varying vec2 vUv;

        void main()
        {
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb -= uTint;
            gl_FragColor = color;
        }
    `
}
const tintPass = new ShaderPass(TintShader)
parameters.uTint = 0.135
tintPass.material.uniforms.uTint.value = new THREE.Vector3(parameters.uTint,parameters.uTint,parameters.uTint)
gui.add(parameters, 'uTint').min(0).max(1).step(0.001).onChange(value => {
    tintPass.material.uniforms.uTint.value = new THREE.Vector3(value,value,value)
})
effectComposer.addPass(tintPass)

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Update controls
    // controls.update()

    const elapsedTime = clock.getElapsedTime()
    particlesMaterial.uniforms.uTime.value = elapsedTime * 0.5 
    // particles.rotation.z = elapsedTime * 0.05



    // Render
    // renderer.render(scene, camera)
    effectComposer.render(scene, camera)


    // Tweaks
    particlesMaterial.uniforms.uParticleSize.value = tweaks.particleSize

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import particlesVertexShader from './shaders/vertex.glsl'
import particlesFragmentShader from './shaders/fragment.glsl'
import { gaussianRandom, spiral } from './utils.js';
import GUI from 'lil-gui'
import { ARMS, ARM_X_DIST, ARM_X_MEAN, ARM_Y_DIST, ARM_Y_MEAN, CORE_X_DIST, CORE_Y_DIST, GALAXY_THICKNESS, OUTER_CORE_X_DIST, OUTER_CORE_Y_DIST } from './config/galaxyConfig.js';
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

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
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 5000000)
camera.position.set(0, 500, 500);
camera.up.set(0, 0, 1);
// camera.lookAt(0, 0, 0);
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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
console.log(colors)

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
window.addEventListener('pointermove', (event) =>
{
    pointer.x = (event.clientX / sizes.width) * 2 - 1
    pointer.y = - (event.clientY / sizes.height) * 2 + 1

    raycaster.setFromCamera(pointer, camera)

    const intersects = raycaster.intersectObject(particles)
    if(intersects.length > 0)
    {
        test.position.copy(intersects[0].point)
        point.copy(intersects[0].point)
        console.log(point)
    }
})


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
        uTexture: new THREE.Uniform(textureLoader.load('/glow.png'))
    }
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const gui = new GUI;
gui 
    .add(tweaks, 'particleSize')
    .min(0.001)
    .max(1)
    .step(0.01)



/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Update controls
    controls.update()

    const elapsedTime = clock.getElapsedTime()
    particlesMaterial.uniforms.uTime.value = elapsedTime * 0.5 
    // particles.rotation.z = elapsedTime * 0.05



    // Render
    renderer.render(scene, camera)


    // Tweaks
    particlesMaterial.uniforms.uParticleSize.value = tweaks.particleSize

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
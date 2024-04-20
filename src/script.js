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
camera.lookAt(0, 0, 0);
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
 * Displacement
 */
const displacement = {}

// 2D canvas
displacement.canvas = document.createElement('canvas')
displacement.canvas.width = 128
displacement.canvas.height = 128
displacement.canvas.style.position = 'fixed'
displacement.canvas.style.width = '256px'
displacement.canvas.style.height = '256px'
displacement.canvas.style.top = 0
displacement.canvas.style.left = 0
displacement.canvas.style.zIndex = 10
// displacement.canvas.style.visibility = "hidden"
document.body.append(displacement.canvas)

// Context
displacement.context = displacement.canvas.getContext('2d')
displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

// Glow image
displacement.glowImage = new Image()
displacement.glowImage.src = './glow.png'

// Interactive plane
displacement.interactivePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 800),
    new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide })
)
displacement.interactivePlane.visible = false
scene.add(displacement.interactivePlane)

// Raycaster
displacement.raycaster = new THREE.Raycaster()

// Coordinates
displacement.screenCursor = new THREE.Vector2(9999, 9999)
displacement.canvasCursor = new THREE.Vector2(9999, 9999)
displacement.canvasCursorPrevious = new THREE.Vector2(9999, 9999)

// Texture
displacement.texture = new THREE.CanvasTexture(displacement.canvas)

window.addEventListener('pointermove', (event) =>
{
    displacement.screenCursor.x = (event.clientX / sizes.width) * 2 - 1
    displacement.screenCursor.y = - (event.clientY / sizes.height) * 2 + 1
})


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
    colors,
    particlesSizes ,
    vertices
 /**
     * Geometry
     */
 const particlesGeometry = new THREE.BufferGeometry()
    
 const positionsTmp = []
 colors = new Float32Array(parameters.count * 3)
 
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

 for ( let i = 0; i < positionsTmp.length; i++)
 {
    // Position
    positions[i] = positionsTmp[i];

    //Color
    let color = new THREE.Color( 0xffffff )
    color.toArray( colors, i * 3 );

     // Size
     particlesSizes[i] = parameters.size;
 }


particlesGeometry.setAttribute( 'position', new THREE.BufferAttribute(positions, 3) )
particlesGeometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
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
    particleSize : 0.15
}

const particlesMaterial = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms:
    {
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uParticleSize:  new THREE.Uniform(tweaks.particleSize),
        uDisplacementTexture: new THREE.Uniform(displacement.texture),
        PI: new THREE.Uniform(Math.PI),
        uTime: new THREE.Uniform(0),
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
    // particlesMaterial.uniforms.uTime.value = elapsedTime
    particles.rotation.z = elapsedTime * 0.05

    /**
     * Raycaster
     */
    displacement.raycaster.setFromCamera(displacement.screenCursor, camera)
    const intersections = displacement.raycaster.intersectObject(displacement.interactivePlane)
    if(intersections.length)
    {
        const uv = intersections[0].uv

        displacement.canvasCursor.x = uv.x * displacement.canvas.width
        displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height
    }

    /**
     * Displacement
     */

    // Fade out
    displacement.context.globalCompositeOperation = 'source-over'
    displacement.context.globalAlpha = 0.02
    displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

     // Speed alpha
     const cursorDistance = displacement.canvasCursorPrevious.distanceTo(displacement.canvasCursor)
     displacement.canvasCursorPrevious.copy(displacement.canvasCursor)
     const alpha = Math.min(cursorDistance * 0.1, 1)

    // Draw glow
    displacement.context.globalCompositeOperation = 'lighten'
    displacement.context.globalAlpha = alpha
    const glowSize = displacement.canvas.width * 0.25
    displacement.context.drawImage(
        displacement.glowImage,
        displacement.canvasCursor.x - glowSize * 0.5,
        displacement.canvasCursor.y - glowSize * 0.5,
        glowSize,
        glowSize
    )

    // Texture
    displacement.texture.needsUpdate = true

    // Render
    renderer.render(scene, camera)

    // Tweaks
    particlesMaterial.uniforms.uParticleSize.value = tweaks.particleSize

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
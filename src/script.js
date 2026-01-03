import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import particlesVertexShader from './shaders/vertex.glsl'
import particlesFragmentShader from './shaders/fragment.glsl'
import gasVertexShader from './shaders/gasVertex.glsl'
import gasFragmentShader from './shaders/gasFragment.glsl'
import disqueVertexShader from './shaders/disqueVertex.glsl'
import disqueFragmentShader from './shaders/disqueFragment.glsl'
import { gaussianRandom, spiral } from './utils.js';
import GUI from 'lil-gui'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { ARMS, ARM_X_DIST, ARM_X_MEAN, ARM_Y_DIST, ARM_Y_MEAN, CORE_X_DIST, CORE_Y_DIST, GALAXY_THICKNESS, OUTER_CORE_X_DIST, OUTER_CORE_Y_DIST, GAS_COUNT, GAS_PARTICLE_SIZE, GAS_THICKNESS, GAS_CORE_X_DIST, GAS_CORE_Y_DIST, GAS_OUTER_CORE_X_DIST, GAS_OUTER_CORE_Y_DIST, GAS_ARM_X_DIST, GAS_ARM_Y_DIST, GAS_ARM_X_MEAN, GAS_ARM_Y_MEAN } from './config/galaxyConfig.js';
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
    gasMaterial.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)
    diskMaterial.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)

    // Update effect composer
    // effectComposer.setSize(sizes.width, sizes.height)
    // effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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
parameters.count = 50000
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
const redStarColor = new THREE.Color('#ff9955') // Étoiles rouges
const whiteStarColor = new THREE.Color('#ffffff') // Étoiles blanches

// Identifier le nombre de particules dans chaque section
const coreCount = parameters.count / 4
const outerCoreCount = parameters.count / 4
const armsStartIndex = coreCount + outerCoreCount // Index de début des bras
 
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
     const pos = new THREE.Vector3(positions[i3],positions[i3+1],positions[i3+2])
     const distanceFromCenter = pos.distanceTo(new THREE.Vector3(0,0,0))
     
     // Vérifier si la particule est dans les bras
     const isInArms = i >= armsStartIndex
     
     let finalColor
     if (isInArms) {
         // Pour les particules dans les bras, ajouter des étoiles rouges et blanches
         const randomValue = Math.random()
         if (randomValue < 0.33) {
             // 33% d'étoiles rouges dans les bras
             finalColor = redStarColor.clone()
             // Ajouter une légère variation de luminosité
             const brightness = 0.8 + Math.random() * 0.4
             finalColor.multiplyScalar(brightness)
         } else if (randomValue < 0.66) {
             // 33% d'étoiles blanches dans les bras
             finalColor = whiteStarColor.clone()
             // Ajouter une légère variation de luminosité
             const brightness = 0.7 + Math.random() * 0.3
             finalColor.multiplyScalar(brightness)
         } else {
             // 70% gardent la couleur normale basée sur la distance
             finalColor = insideColor.clone()
             finalColor.lerp(outsideColor, distanceFromCenter / 1.5 / OUTER_CORE_X_DIST)
         }
     } else {
         // Pour le noyau, garder la couleur normale
         finalColor = insideColor.clone()
         finalColor.lerp(outsideColor, distanceFromCenter / 1.5 / OUTER_CORE_X_DIST)
     }

     colors[i3    ] = finalColor.r
     colors[i3 + 1] = finalColor.g
     colors[i3 + 2] = finalColor.b
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

const raycastPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.01})
)
raycastPlane.position.set(0, 0, 0)
scene.add(raycastPlane)

document.querySelector('canvas')?.addEventListener('mousemove', event =>
{
    pointer.x = (event.x / sizes.width) * 2 - 1
    pointer.y = - (event.y / sizes.height) * 2 + 1

    raycaster.setFromCamera(pointer, camera)

    const intersects = raycaster.intersectObject(raycastPlane)
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

    const intersects = raycaster.intersectObject(raycastPlane)
    if(intersects.length > 0)
    {
        test.position.lerp(intersects[0].point, 0.2)
        point.lerp(intersects[0].point, 0.5)
    }
})

let glowPath = './glow.png'

const particlesMaterial = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    // depthWrite: false,
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

/**
 * Disque principal bleu transparent
 */
const galaxyRadius = Math.max(OUTER_CORE_X_DIST, ARM_X_MEAN + ARM_X_DIST * 2)
const diskGeometry = new THREE.RingGeometry(CORE_X_DIST * 2.5, galaxyRadius * 2.2, 30, 64)
const diskMaterial = new THREE.ShaderMaterial({
    blending: THREE.NormalBlending,
    depthWrite: false,
    depthTest: false,
    transparent: true,
    vertexShader: disqueVertexShader,
    fragmentShader: disqueFragmentShader,
    uniforms: {
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uTime: new THREE.Uniform(0),
        uGalaxyRadius: new THREE.Uniform(galaxyRadius),
        uTexture: new THREE.Uniform(textureLoader.load('./clouds/7.png'))
    }
})
const disk = new THREE.Mesh(diskGeometry, diskMaterial)
disk.position.set(0, 0, 0)

scene.add(disk)

/**
 * Gaz interstellaire - Nuages dans les bras uniquement
 */
const gasTweaks = {
    gasParticleSize: GAS_PARTICLE_SIZE,
}

// Génération des positions du gaz - uniquement dans les bras de la galaxie
const maxRadius = Math.max(GAS_OUTER_CORE_X_DIST, GAS_ARM_X_MEAN + GAS_ARM_X_DIST * 2)
const coreRadius = Math.max(CORE_X_DIST, CORE_Y_DIST)

// Réduire le nombre de nuages pour qu'ils soient plus petits et plus opaques
const cloudCount = Math.floor(GAS_COUNT * 0.3) // Moins de nuages mais plus visibles

// Créer une géométrie de base (plan) pour chaque nuage
const baseGeometry = new THREE.PlaneGeometry(40, 40)

// Stocker les positions initiales pour calculer les matrices d'instance
const gasPositionsTmp = []
const gasRandom = []
const gasColors = []
const gasDensities = []
const gasIntensities = []
const gasAngles = []
const gasGreyVioletColor = new THREE.Color('#8b7fa8') // Gris/violet

// Générer les données pour chaque instance
for(let i = 0; i < cloudCount; i++)
{
    // Générer les positions uniquement dans les bras en utilisant la fonction spiral
    // Répartir uniformément entre les bras
    const armIndex = Math.floor(Math.random() * ARMS)
    const armOffset = armIndex * 2 * Math.PI / ARMS
    
    // Position dans les bras avec distribution gaussienne
    const x = gaussianRandom(GAS_ARM_X_MEAN, GAS_ARM_X_DIST)
    const y = gaussianRandom(GAS_ARM_Y_MEAN, GAS_ARM_Y_DIST)
    const z = gaussianRandom(0, GAS_THICKNESS)
    
    // Appliquer la transformation en spirale
    const pos = spiral(x, y, z, armOffset)
    
    gasPositionsTmp.push(pos)
    
    // Random pour variation
    const spherical = new THREE.Spherical(
        (0.75 + Math.random() * 0.25),
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
    )
    const randomVec = new THREE.Vector3()
    randomVec.setFromSpherical(spherical)
    
    gasRandom.push(randomVec)
    
    // Couleur gris/violet avec légère variation
    const distanceFromCenter = pos.distanceTo(new THREE.Vector3(0, 0, 0))
    const colorVariation = 0.8 + Math.random() * 0.2
    const finalColor = gasGreyVioletColor.clone().multiplyScalar(colorVariation)
    
    gasColors.push(finalColor)
    
    // Densité plus élevée pour des nuages plus opaques
    gasDensities.push(0.8 + Math.random() * 0.2) // Entre 0.8 et 1.0 pour plus d'opacité
    
    gasIntensities.push(Math.random())
    gasAngles.push(Math.random() * Math.PI * 2)
}

// Créer les matrices d'instance et les attributs instanciés
const instanceMatrices = []
const instanceColors = new Float32Array(cloudCount * 3)
const instanceRandom = new Float32Array(cloudCount * 3)
const instanceDensities = new Float32Array(cloudCount)
const instanceIntensities = new Float32Array(cloudCount)
const instanceAngles = new Float32Array(cloudCount)

for (let i = 0; i < cloudCount; i++)
{
    const pos = gasPositionsTmp[i]
    
    // Créer une matrice d'instance pour positionner chaque nuage
    // L'orientation billboard est gérée dans le vertex shader
    const matrix = new THREE.Matrix4()
    matrix.setPosition(pos)
    
    instanceMatrices.push(matrix)
    
    // Remplir les attributs instanciés
    instanceColors[i * 3] = gasColors[i].r
    instanceColors[i * 3 + 1] = gasColors[i].g
    instanceColors[i * 3 + 2] = gasColors[i].b
    
    instanceRandom[i * 3] = gasRandom[i].x
    instanceRandom[i * 3 + 1] = gasRandom[i].y
    instanceRandom[i * 3 + 2] = gasRandom[i].z
    
    instanceDensities[i] = gasDensities[i]
    instanceIntensities[i] = gasIntensities[i]
    instanceAngles[i] = gasAngles[i]
}

// Créer la géométrie instanciée
const gasGeometry = baseGeometry.clone()

// Ajouter les attributs instanciés
gasGeometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(instanceColors, 3))
gasGeometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(instanceRandom, 3))
gasGeometry.setAttribute('aDensity', new THREE.InstancedBufferAttribute(instanceDensities, 1))
gasGeometry.setAttribute('aIntensity', new THREE.InstancedBufferAttribute(instanceIntensities, 1))
gasGeometry.setAttribute('aAngle', new THREE.InstancedBufferAttribute(instanceAngles, 1))

let cloudPath = './clouds/4.png'
let cloudPath2 = './clouds/3.png'
// if( window.location.href.includes("github") ) cloudPath = "."+cloudPath


// Matériau du gaz
// Optimisations de performance :
// - Utilisation d'InstancedMesh pour meilleures performances
// - Frustum culling automatique par Three.js
// - Depth test activé pour éviter le rendu inutile
const gasMaterial = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false, // Activer le depth test pour que le gaz soit derrière les étoiles
    transparent: true,
    vertexShader: gasVertexShader,
    fragmentShader: gasFragmentShader,
    // Optimisation : désactiver certaines fonctionnalités inutiles
    fog: false,
    lights: false,
    uniforms:
    {
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uGasParticleSize: new THREE.Uniform(GAS_PARTICLE_SIZE * 0.5), // Nuages plus petits
        uPointer: new THREE.Uniform(point),
        PI: new THREE.Uniform(Math.PI),
        uTime: new THREE.Uniform(0),
        uTexture: new THREE.Uniform(textureLoader.load(cloudPath)),
        uTexture2: new THREE.Uniform(textureLoader.load(cloudPath2)),
        uMaxRadius: new THREE.Uniform(maxRadius),
        uCoreRadius: new THREE.Uniform(coreRadius)
    }
})

// Créer l'InstancedMesh
const gas = new THREE.InstancedMesh(gasGeometry, gasMaterial, cloudCount)

// Appliquer les matrices d'instance
for (let i = 0; i < cloudCount; i++)
{
    gas.setMatrixAt(i, instanceMatrices[i])
}

gas.instanceMatrix.needsUpdate = true
gas.frustumCulled = true
gas.visible = false
scene.add(gas)

const gui = new GUI;
// gui.hide();
gui 
    .add(tweaks, 'particleSize')
    .min(0.001)
    .max(1)
    .step(0.01)
   
gui.add(gasTweaks, 'gasParticleSize')
    .min(0.5)
    .max(50)
    .step(0.1)



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
parameters.uTint = 0.05
tintPass.material.uniforms.uTint.value = new THREE.Vector3(parameters.uTint,parameters.uTint,parameters.uTint)
gui.add(parameters, 'uTint').min(0).max(1).step(0.001).onChange(value => {
    tintPass.material.uniforms.uTint.value = new THREE.Vector3(value,value,value)
})
effectComposer.addPass(tintPass)


/**
 * Stats
 */
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)
/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    stats.begin()
    // Update controls
    controls.update()

    const elapsedTime = clock.getElapsedTime()
    particlesMaterial.uniforms.uTime.value = elapsedTime * 0.5 
    gasMaterial.uniforms.uTime.value = elapsedTime * 0.5
    diskMaterial.uniforms.uTime.value = elapsedTime * 0.5
    // particles.rotation.z = elapsedTime * 0.05


    disk.rotation.z = elapsedTime * 0.05

    // Render
    // renderer.render(scene, camera)
    effectComposer.render(scene, camera)


    // Tweaks
    particlesMaterial.uniforms.uParticleSize.value = tweaks.particleSize
    gasMaterial.uniforms.uGasParticleSize.value = gasTweaks.gasParticleSize

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    stats.end()
}

tick()
uniform vec2 uResolution;
uniform float uGasParticleSize;
uniform float PI;
uniform float uTime;
uniform vec3 uPointer;

// Attributs par instance
attribute float aIntensity;
attribute float aAngle;
attribute vec3 aRandom;
attribute vec3 aColor;
attribute float aDensity;

varying vec3 vColor;
varying float vDensity;
varying float vIntensity;
varying vec3 vPosition;
varying float vDistanceToCenter;
varying vec2 vUv; // Coordonnées UV pour le fragment shader

void main()
{
    // Transformation standard avec instanceMatrix
    vec4 instanceWorldPosition = instanceMatrix * vec4(position, 1.0);
    vec4 modelPosition = modelMatrix * instanceWorldPosition;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Calculer la distance au centre pour les variations
    float distanceToCenter = length(modelPosition.xy);

    vColor = aColor;
    vDensity = aDensity;
    vIntensity = aIntensity;
    vPosition = modelPosition.xyz;
    vDistanceToCenter = distanceToCenter;
    vUv = uv;
}

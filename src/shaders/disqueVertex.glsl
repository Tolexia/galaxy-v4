uniform vec2 uResolution;
uniform float uTime;
uniform float uGalaxyRadius;

varying vec2 vUv;
varying float vDistanceToCenter;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Rotation très lente du disque
    float distanceToCenter = length(modelPosition.xy);
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    
    vUv = uv;
    vDistanceToCenter = distanceToCenter;
}


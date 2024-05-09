uniform vec2 uResolution;
uniform sampler2D uDisplacementTexture;
uniform float uParticleSize;
uniform float PI;
uniform float uTime;
uniform vec3 uPointer;

attribute float aIntensity;
attribute float aAngle;
attribute vec3 aRandom;
attribute vec3 aColor;


varying vec3 vColor;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                
    // Rotate
    float angle = atan(modelPosition.x, modelPosition.y);
    float distanceToCenter = length(modelPosition.xy);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 20.;
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.y = sin(angle) * distanceToCenter;
    
    float distanceToPointer = (distance(modelPosition.xyz, uPointer));
    float intensity = 1. / distanceToPointer;
    intensity = smoothstep(0.0, 0.1, intensity);

    // vColor = vec3( intensity * 10., 1.,1.);
    vColor = aColor;

    modelPosition.x += intensity * 50. * aRandom.x;
    modelPosition.y += intensity * 50. * aRandom.y;
    modelPosition.z += intensity * 5. * aRandom.z;


    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    


    // Point size
    // gl_PointSize = 0.3 * uResolution.y; Initial
    gl_PointSize = uParticleSize * uResolution.y;


    gl_PointSize *= (1.0 / - viewPosition.z);

}
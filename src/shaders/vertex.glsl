uniform vec2 uResolution;
uniform sampler2D uDisplacementTexture;
uniform float uParticleSize;
uniform float PI;


attribute float aIntensity;
attribute float aAngle;

uniform float uTime;
uniform vec3 uPointer;

varying vec3 vColor;

void main()
{
    // Displacement
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    float distanceToPointer = abs(distance(position, uPointer));
    float intensity = 0.5 / distanceToPointer;

    // vColor = uPointer;

    modelPosition.xyz += intensity * 600.;

    // Final position
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;


    // Point size
    // gl_PointSize = 0.3 * uResolution.y; Initial
    gl_PointSize = uParticleSize  * uResolution.y;


    gl_PointSize *= (1.0 / - viewPosition.z);

}
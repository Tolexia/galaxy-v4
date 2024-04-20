uniform vec2 uResolution;
uniform sampler2D uDisplacementTexture;
uniform float uParticleSize;
uniform float PI;


attribute float aIntensity;
attribute float aAngle;

uniform float uTime;

varying vec3 vColor;

void main()
{
    // Displacement
    vec3 newPosition = position;
    float displacementIntensity = texture(uDisplacementTexture, uv).r;
    displacementIntensity = smoothstep(0.1, 0.3, displacementIntensity);
    vec3 displacement = vec3(
        cos(aAngle) * 0.2,
        sin(aAngle) * 0.2,
        10.0
    );
    displacement = normalize(displacement);
    displacement *= displacementIntensity * 10.;
    displacement *= aIntensity * 10.;
    newPosition += displacement;


    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;


    // Point size
    // gl_PointSize = 0.3 * uResolution.y; Initial
    gl_PointSize = uParticleSize  * uResolution.y;


    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    // vColor = vec3(pow(pictureIntensity, 2.0));
}
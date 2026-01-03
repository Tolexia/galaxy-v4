varying vec3 vColor;
varying float vDensity;
varying float vIntensity;
varying vec3 vPosition;
varying float vDistanceToCenter;
varying vec2 vUv; // Coordonnées UV de la géométrie
uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float uTime;
uniform float uMaxRadius;
uniform float uCoreRadius;

void main()
{
    vec2 uv = vUv;
    
    // Créer un effet de nuage plus diffus et doux
    float distanceToCenter = distance(uv, vec2(0.5));
    float strength = 1.0 - smoothstep(0.0, 0.6, distanceToCenter); // Bordure plus douce
    
    strength *= (0.5 + vIntensity * 0.5); // Variation d'intensité
    
    // Texture pour le glow
    vec4 textureColor = texture2D(uTexture, uv);
    
    // Couleur gris/violet pour les nuages dans les bras
    vec3 gasColor = textureColor.rgb * vColor * 0.85;
    
    // Alpha avec densité
    float alpha = textureColor.a * strength * vDensity;

    gl_FragColor = vec4(gasColor, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}

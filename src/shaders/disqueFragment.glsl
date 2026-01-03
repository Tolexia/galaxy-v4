uniform sampler2D uTexture;
uniform float uTime;
uniform float uGalaxyRadius;
uniform vec2 uResolution;

varying vec2 vUv;
varying float vDistanceToCenter;

void main()
{
    // Coordonnées UV centrées pour créer un disque
    vec2 centeredUv = vUv * 2.0 - 1.0;
    float distanceFromCenter = length(centeredUv);
    
    // Créer un disque avec bordure douce
    float diskMask = 1.0 - smoothstep(0.0, 1.0, distanceFromCenter);
    
    // Texture de nuage avec animation subtile
    vec2 animatedUv = vUv + vec2(sin(uTime * 0.01)*0.01, cos(uTime * 0.005)*0.01);
    vec4 cloudTexture = texture2D(uTexture, animatedUv);
    
    // Combiner la texture avec le masque du disque
    // float alpha = cloudTexture.r * diskMask;
    float alpha = cloudTexture.r;
    
    // Fade out progressif vers l'extérieur
    float normalizedDistance = clamp(vDistanceToCenter / uGalaxyRadius, 0.0, 1.0);
    // alpha *= (1.0 - smoothstep(0.5, 1.0, normalizedDistance));
    
    // Couleur bleue transparente
    vec3 blueColor = vec3(0.3, 0.5, 0.9); // Bleu ciel
    vec3 finalColor = blueColor * (0.5 + cloudTexture.r * 0.5);
    
    // Alpha faible pour transparence
    alpha *= 0.25;
    
    // gl_FragColor = vec4(finalColor, alpha);
    gl_FragColor = cloudTexture * vec4(blueColor, alpha);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}


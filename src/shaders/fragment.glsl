

varying vec3 vColor;
uniform sampler2D uTexture;

void main()
{
    vec2 uv = gl_PointCoord;
    // float distanceToCenter = length(uv - vec2(0.5));
    // float distanceToCenter = distance(uv, vec2(0.5)); // More advanced and used technique
    // if(distanceToCenter > 0.5)
    //         discard;

    vec4 ttt = texture2D(uTexture, uv);

    gl_FragColor = vec4(vec3(1.), ttt.r);
    // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    // gl_FragColor = vec4(vColor, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
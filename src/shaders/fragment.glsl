
uniform sampler2D uPictureTexture;

varying vec3 vColor;

void main()
{
    vec2 uv = gl_PointCoord;
    // float distanceToCenter = length(uv - vec2(0.5));
    float distanceToCenter = distance(uv, vec2(0.5)); // More advanced and used technique
    if(distanceToCenter > 0.5)
            discard;

    gl_FragColor = vec4(1.0,1.,1., 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
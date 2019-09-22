export const fullscreenVertShader = `
precision highp float;

attribute vec3 position;

uniform vec2 px;

varying vec2 vUv;

void main(){
    vUv = vec2(0.5)+(position.xy)*0.5;
    gl_Position = vec4(position, 1.0);
}
`;

export const fillFragShader = `
precision highp float;

varying vec2 vUv;

void main(){
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}
`;

export const texFragShader = `
precision highp float;

uniform sampler2D uTexture;

varying vec2 vUv;

void main(){
    vec4 texColor = texture2D(uTexture, vUv);
    gl_FragColor = texColor;
}
`;

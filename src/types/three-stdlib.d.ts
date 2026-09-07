declare module 'three-stdlib' {
  export class OrbitControls {
    [key: string]: any;
    constructor(object?: any, domElement?: HTMLElement);
    reset(): void;
    update(): void;
    dispose(): void;
  }
}

declare module 'georaster' {
  interface Georaster {
    values: number[][][];
    width: number;
    height: number;
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
    pixelWidth: number;
    pixelHeight: number;
    projection: string;
    sourceType: string;
    rasterType: string;
  }

  function parseGeoraster(arrayBuffer: ArrayBuffer): Promise<Georaster>;
  export = parseGeoraster;
}

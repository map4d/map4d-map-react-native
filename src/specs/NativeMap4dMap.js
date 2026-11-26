import {TurboModuleRegistry} from 'react-native';

export interface Spec {
  getCamera(reactTag: number): Promise<Object>;
  getBounds(reactTag: number): Promise<Object>;
  getMyLocation(reactTag: number): Promise<Object>;
  pointForCoordinate(reactTag: number, coordinate: Object): Promise<Object>;
  coordinateForPoint(reactTag: number, point: Object): Promise<Object>;
  cameraForBounds(reactTag: number, boundsData: Object): Promise<Object>;
}

export default TurboModuleRegistry.get<Spec>('Map4dMap');

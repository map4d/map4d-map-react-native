import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getCamera(reactTag: number): Promise<Object>;
  getBounds(reactTag: number): Promise<Object>;
  getMyLocation(reactTag: number): Promise<Object>;
  getMapStyle(reactTag: number): Promise<?string>;
  pointForCoordinate(reactTag: number, coordinate: Object): Promise<Object>;
  coordinateForPoint(reactTag: number, point: Object): Promise<Object>;
  cameraForBounds(reactTag: number, boundsData: Object): Promise<Object>;
}

// prettier-ignore
export default TurboModuleRegistry.getEnforcing<Spec>('Map4dMap');

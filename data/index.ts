import raw from './petsData.json';
import type { PetsData } from '../types/petsData';

export const petsData = raw as unknown as PetsData;
export default petsData;

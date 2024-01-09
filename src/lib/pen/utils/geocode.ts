import axios from "axios";
import { PenCoordinates } from "../person";

export type NominatimGeocodeSearchResult = {
  lat: number;
  lon: number;
}

export type NominationReverseGeocodeSearchResult = {
  address: {
    town: string;
  }
}

export const geocodeSearch = async (query: string): Promise<NominatimGeocodeSearchResult | undefined> => {
  return axios
    .get<Array<NominatimGeocodeSearchResult>>(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
    .then((res) => res.data.length > 0 ? res.data[0] : undefined);
}

export const reverseGeocodeSearch = async ({ lat, lon }: PenCoordinates): Promise<NominationReverseGeocodeSearchResult> => {
  return axios
    .get<NominationReverseGeocodeSearchResult>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    .then((res) => res.data);
}
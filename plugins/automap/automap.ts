import { FlatfileListener } from "@flatfile/listener";
import { Flatfile } from "@flatfile/api";
import { AutomapService } from "./service";

/**
 * Automap plugin for Flatfile.
 *
 * @param options
 */
export function automap(options: AutomapOptions) {
  const automapper = new AutomapService(options);
  return (listener: FlatfileListener) => {
    automapper.assignListeners(listener);
  };
}

export interface AutomapOptions {
  accuracy: "exact" | "remembered";
  matchFilename?: RegExp;
  selectSheets?: (
    records: Flatfile.RecordsWithLinks,
    sheet: Flatfile.Sheet
  ) => string | false | Promise<string | false>;
  defaultTargetSheet?: string;
  targetWorkbook?: string;
}
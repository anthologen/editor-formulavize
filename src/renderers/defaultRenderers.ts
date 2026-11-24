import { RendererPlugin } from "@formulavize/renderer-api-formulavize";
import { cytoscapePlugin } from "@formulavize/renderer-cytoscape-formulavize";
import { minimalPlugin } from "@formulavize/renderer-minimal-formulavize";

/**
 * Renderers the app ships with.
 *
 * This is the place a renderer is registered: add its package as a dependency,
 * import its plugin and add it here. The first entry is the default, used when
 * a recipe selects no renderer.
 */
export const defaultRendererPlugins: readonly RendererPlugin[] = [
  cytoscapePlugin,
  minimalPlugin,
];

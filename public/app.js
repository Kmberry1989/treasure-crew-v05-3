import { configureAssetRendering, loadAssetManifest } from "./app/assets.js";
import { configureRoomClient, connectStream } from "./app/room-client.js";
import { render } from "./app/render-shell.js";
import { state } from "./app/state.js";

configureAssetRendering(render);
configureRoomClient({ render });

if (state.code && state.playerId) connectStream(state.code);
render();
loadAssetManifest();

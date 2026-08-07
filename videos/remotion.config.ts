import { Config } from '@remotion/cli/config';

// Instagram-friendly output: H.264 MP4, high quality, no alpha channel.
Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setCrf(18); // 18 = visually lossless-ish; Instagram re-encodes, so give it headroom.
Config.setPixelFormat('yuv420p'); // Required for broad playback/Instagram compatibility.
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // Let Remotion pick based on available cores.

// Studio conveniences
Config.setChromiumOpenGlRenderer('angle');

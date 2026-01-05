import React, { memo, useEffect, useRef, useState } from "react";

type Props = {
  src: string;                 // 视频地址
  poster?: string;             // 封面图片（可选）
  className?: string;
  loop?: boolean;              // 是否循环播放，默认 true
  muted?: boolean;             // 初始是否静音（默认 true）
  controls?: boolean;          // 是否显示浏览器原生 controls（默认 false）
  onDownloadComplete?: () => void;
  onPlay?: () => void;
  onError?: (err: any) => void;
};
const VideoPlayer = memo(
  ({
    src,
    poster,
    className,
    loop = false,
    muted = false,
    controls = false,
    onDownloadComplete,
    onPlay,
    onError,
  }: Props) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [coverVisible, setCoverVisible] = useState(true);
    const [triedMutedPlay, setTriedMutedPlay] = useState(false);

    // 检查 buffered 是否已经包含整个媒体（完全部署到本地缓存/下载完毕）
    const isFullyBuffered = (video: HTMLVideoElement) => {
      try {
        const buff = video.buffered;
        if (!buff || buff.length === 0) return false;
        const end = buff.end(buff.length - 1);
        // 如果尚未有 duration（例如还没 metadata），返回 false
        if (!video.duration || Number.isNaN(video.duration) || !isFinite(video.duration)) return false;
        // 使用小的 eps 做比较
        return end >= video.duration - 0.01;
      } catch (err) {
        return false;
      }
    };

    // 尝试播放：先尝试常规 play，若被浏览器策略阻止则尝试静音后再 play
    const tryAutoPlay = async () => {
      const v = videoRef.current;
      if (!v) return;
      try {
        await v.play();
        setIsPlaying(true);
        onPlay?.();
        setTimeout(() => {
          setCoverVisible(false);
        }, 0)
      } catch (err) {
        // autoplay 被阻止 -> 尝试静音后再播放（大多数浏览器允许静音自动播放）
        if (!triedMutedPlay) {
          try {
            v.muted = true;
            setTriedMutedPlay(true);
            await v.play();
            setIsPlaying(true);
            setTimeout(() => {
              setCoverVisible(false);
            }, 0)
            onPlay?.();
          } catch (err2) {
            // 最终无法自动播放：保持封面，report error optionally
            onError?.(err2);
          }
        } else {
          onError?.(err);
        }
      }
    };

    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;

      // 当浏览器触发 canplaythrough，说明足够数据可以不间断播放 -> 自动播放
      const onCanPlayThrough = () => {
        // 触发下载完成回调
        onDownloadComplete?.();
        tryAutoPlay();
      };

      // 备用策略：监听 progress 事件并判断 buffered 是否覆盖全部 duration
      const onProgress = () => {
        if (isFullyBuffered(v)) {
          onDownloadComplete?.();
          tryAutoPlay();
        }
      };

      // 当 metadata 可用时，如果已经 buffered 完整也触发
      const onLoadedMeta = () => {
        if (isFullyBuffered(v)) {
          onDownloadComplete?.();
          tryAutoPlay();
        }
      };

      const onPlayHandler = () => {
        setIsPlaying(true);
        setTimeout(() => {
          setCoverVisible(false);
        }, 0)
        onPlay?.();
      };

      const onPauseHandler = () => {
        setIsPlaying(false);
      };

      const onErr = (ev: any) => {
        onError?.(ev);
      };
      const onTimeUpdate = () => {
        // console.log("timeupdate", v.duration, v.currentTime );
      // 快结束时提前跳到头（提前 0.05 秒）
        if (v.duration - v.currentTime < 0.001401) {
          v.currentTime = 0;
          v.play();
        }
      };

      v.addEventListener("canplaythrough", onCanPlayThrough);
      v.addEventListener("progress", onProgress);
      v.addEventListener("loadedmetadata", onLoadedMeta);
      v.addEventListener("play", onPlayHandler);
      v.addEventListener("pause", onPauseHandler);
      v.addEventListener("error", onErr);
      v.addEventListener("timeupdate", onTimeUpdate);

      // 如果 video 标签已经处于可以播放状态（页面可能从缓存中加载），主动检查
      if (v.readyState >= 3) {
        // readyState >= HAVE_FUTURE_DATA
        // treat as canplaythrough candidate
        onCanPlayThrough();
      }

      return () => {
        v.removeEventListener("canplaythrough", onCanPlayThrough);
        v.removeEventListener("progress", onProgress);
        v.removeEventListener("loadedmetadata", onLoadedMeta);
        v.removeEventListener("play", onPlayHandler);
        v.removeEventListener("pause", onPauseHandler);
        v.removeEventListener("error", onErr);
        v.removeEventListener("timeupdate", onTimeUpdate);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoRef.current, triedMutedPlay]);

    // 如果外部改变 src，重置状态
    useEffect(() => {
      setIsPlaying(false);
      setTriedMutedPlay(false);
      const v = videoRef.current;
      if (v) {
        v.pause();
        // 取消静音（保留用户设置：此处恢复到 props.muted）
        v.muted = muted;
        // reload resource
        v.load();
      }
    }, [src, muted]);

    return (
      <div className={className} style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
        {/* video 元素：100% 宽高，循环 */}
        <video
          ref={videoRef}
          src={src}
          loop={loop}
          muted={muted}
          playsInline
          // 不默认显示 controls，按需传 controls=true to show native controls
          controls={controls}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: isPlaying ? 1 : 0, transition: "opacity 0.5s ease", 

            position: 'relative',
            zIndex: !coverVisible ? 5 : 1
          }}
          // poster 属性只在未加载时显示浏览器的 poster，用我们自定义封面更可靠
          poster={poster}

        />

        {/* 自定义封面层：在未播放前显示，播放后隐藏 */}
        {poster && (
          <div
            aria-hidden
            className="video-cover transition-all "
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `url(${poster})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 2,
              // opacity: coverVisible ? 1 : 0
            }}
            onClick={() => {
              try {
                videoRef.current?.play();
              } catch (err) {
                // ignore
              }
            }}
          >
          </div>
        )}
      </div>
    );
  }
)
export { VideoPlayer } 

import React from 'react';
import { motion } from 'motion/react';
import type { VideoGenerationJob } from '../utils/videoGenerationClient';
import { LucideIcon } from './LucideIcon';

interface VideoGenerationToastProps {
  job: VideoGenerationJob;
  onOpenCreate: () => void;
}

export const VideoGenerationToast: React.FC<VideoGenerationToastProps> = ({ job, onOpenCreate }) => {
  const done = job.status === 'completed';
  const failed = job.status === 'failed';

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      onClick={onOpenCreate}
      className="fixed top-4 left-0 right-0 max-w-md mx-auto z-50 px-5"
    >
      <div className={`mx-auto flex w-fit max-w-[calc(100%-40px)] items-center gap-2 rounded-full border px-3 py-2 text-[11px] shadow-2xl backdrop-blur-xl ${
        failed
          ? 'border-red-400/25 bg-red-950/75 text-red-200'
          : done
            ? 'border-emerald-400/25 bg-emerald-950/75 text-emerald-200'
            : 'border-cyan-400/25 bg-zinc-950/80 text-cyan-200'
      }`}
      >
        <LucideIcon
          name={failed ? 'CircleAlert' : done ? 'CheckCircle2' : 'Loader2'}
          size={13}
          className={!done && !failed ? 'animate-spin' : ''}
        />
        <span className="font-semibold truncate">
          {failed ? '视频生成失败' : done ? '视频已生成，点击发布' : '正在生成视频中'}
        </span>
        <span className="text-white/45 font-mono">{job.provider}</span>
      </div>
    </motion.button>
  );
};

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConfirmationMessageProps {
  /**
   * The message to appear in purple box when the process will be successfully completed.
   */
  successMessage: string;

  /**
   * The name of the organization/bot who performs the operations.
   */
  labelName: string;

  /**
   * The brief about the process/text/output.
   */
  labelMessage: string;

  /**
   * Class name for the background element.
   */
  backgroundClassName?: string;

  /**
   * Class name for the container element.
   */
  containerClassName?: string;
}

export default function ConfirmationMessage({
  successMessage = "Process Successful",
  labelName = "XFunnel",
  labelMessage,
  backgroundClassName,
  containerClassName,
}: ConfirmationMessageProps) {
  return (
    <div
      className={cn(
        "storybook-fix group fixed inset-0 z-50 flex items-center justify-center",
        containerClassName,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 -z-10 h-full w-full items-center bg-gradient-to-r from-purple-100 to-purple-300",
          backgroundClassName,
        )}
      />

      {/* Parent Container for message */}
      <div className="flex h-64 max-w-lg flex-col items-center justify-center">
        <div className="flex h-20 items-center justify-center overflow-hidden rounded-full bg-primary">
          {/* Checkmark */}
          <div className="z-10 flex h-20 w-20 flex-col content-center items-center justify-center rounded-full bg-primary text-3xl text-white">
            &#10003;
          </div>

          {/* Expanding purple box with sliding text */}
          <motion.div
            className="z-0 flex h-20 overflow-hidden rounded-full bg-primary"
            initial={{ width: "0rem" }}
            animate={{ width: "12rem" }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.div
              className="flex items-center text-nowrap pr-6 text-lg text-white"
              initial={{ x: -1000, zIndex: -10 }}
              animate={{ x: 0, zIndex: 1 }}
              transition={{ duration: 1.0, delay: 0.3 }}
            >
              {successMessage}
            </motion.div>
          </motion.div>
        </div>

        {/* Container to control height animation */}
        <motion.div
          className="relative flex h-fit w-[600px] max-w-lg overflow-hidden"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          {/* Message box */}
          <div className="my-4 flex h-fit w-full rounded-lg border border-white/40 bg-white/30 bg-opacity-90 p-6 py-4 shadow-lg backdrop-blur-md">
            <div className="mr-4 flex h-12 min-w-12 items-center justify-center rounded-full bg-primary text-white">
              {labelName[0]}
            </div>
            <div className="text-gray-800">
              <p className="text-xl font-bold text-slate-500">{labelName}</p>
              <motion.p
                className="max-w-[390px] truncate text-wrap font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.9 }}
              >
                {labelMessage.length > 200 ? labelMessage.slice(0, 199) + "..." : labelMessage}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
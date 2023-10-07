const getTimeRemaining = (deadline: Date) => {
  const total = deadline.getTime() - Date.now();
  const totalSeconds = Math.floor(total / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor(totalSeconds % (3600 * 24) / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return {
    total, days, hours, minutes, seconds
  };
};

const startTimer = (
  timerEvent: NodeJS.Timer,
  deadline: Date,
  setTimeRemaining: React.Dispatch<React.SetStateAction<string>> | null,
  setExpired: React.Dispatch<React.SetStateAction<boolean>>,
  expired: boolean
) => {
  const { total, days, hours, minutes/*, seconds */} = getTimeRemaining(deadline);
  if (total >= 0) {
    let remainingTime = '';
    if (days > 0) {
      remainingTime = `${days}d left`;
    } else if (hours > 0) {
      remainingTime = `${hours}h left`;
    } else {
      remainingTime = `${minutes}m left`;
    }
    setTimeRemaining && setTimeRemaining(remainingTime);
    if (expired) setExpired(false);
  } else {
    setTimeRemaining && setTimeRemaining('Finished');
    clearInterval(timerEvent);
  }
};

const updateDeadline = (
  deadline: Date,
  _timerEvent: React.MutableRefObject<NodeJS.Timer | null>,
  setTimeRemaining: React.Dispatch<React.SetStateAction<string>> | null,
  setExpired: React.Dispatch<React.SetStateAction<boolean>>,
  expired: boolean
) => {
  if (_timerEvent.current) clearInterval(_timerEvent.current);
  const timerEvent = setInterval(() => {
    startTimer(timerEvent, deadline, setTimeRemaining, setExpired, expired);
  }, 1000);
  _timerEvent.current = timerEvent;
};

export { updateDeadline };

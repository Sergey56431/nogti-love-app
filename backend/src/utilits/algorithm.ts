export class Algorithm {
  private async _convertTimeToMinutes(time: string): Promise<number> {
    const time1: string[] = time.split(':');
    return +time1[0] * 60 + +time1[1];
  }
  private async _formatMinutesToTime(minutes: number): Promise<string> {
    const time: string[] = [`${Math.floor(minutes / 60)}`, `${minutes % 60}`];
    if (Math.floor(minutes / 60) < 10) {
      time[0] = `0${Math.floor(minutes / 60)}`;
    }
    if (minutes % 60 < 10) {
      time[1] = `0${minutes % 60}`;
    }
    return `${time[0]}:${time[1]}`;
  }
  private async _getServicesDuration(serviceIds: string[]): Promise<number> {
    serviceIds.forEach((id) => {
      const time_servise = prisma.Services.findUnique({
        where: {
          id,
        },
      });
      time_servise.time;
    });
  }
}

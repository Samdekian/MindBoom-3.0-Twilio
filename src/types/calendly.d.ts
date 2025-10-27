
interface CalendlyEvent {
  event: {
    name: string;
    description: string;
    start_time: string;
    end_time: string;
    uuid: string;
  };
  invitee: {
    uuid: string;
  };
}

interface CalendlyInterface {
  initInlineWidget: (options: any) => void;
}

interface Window {
  Calendly?: CalendlyInterface;
}

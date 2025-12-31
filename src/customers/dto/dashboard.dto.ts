export class CustomerDashboardResponseDto {
  user: {
    name: string;
    mobile: string;
  };

  categories: {
    id: string;
    label: string;
    icon: string;
  }[];

  banners: {
    id: number;
    image: string;
    title: string;
  }[];

  activeTrip: any;
}

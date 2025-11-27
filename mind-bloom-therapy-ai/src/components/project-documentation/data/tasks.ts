
import { Task } from "../TaskTypes";
import { authTasks } from "./auth-tasks";
import { hipaaTasks } from "./hipaa-tasks";
import { profileTasks } from "./profile-tasks";
import { securityTasks } from "./security-tasks";
import { documentationTasks } from "./documentation-tasks";
import { dashboardTasks } from "./dashboard-tasks";
import { calendarTasks } from "./calendar-tasks";

export const tasks: Task[] = [
  ...authTasks,
  ...hipaaTasks,
  ...profileTasks,
  ...securityTasks,
  ...documentationTasks,
  ...dashboardTasks,
  ...calendarTasks,
];

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, take } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import * as moment from 'moment';

export interface Task {
  id?: string;
  order: number;
  title: string;
  date?: string;
}

interface CreateResponse {
  name: string
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  static url = 'https://angular-calendar-d8bb8.firebaseio.com/tasks';
  public tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>(null);

  constructor(private http: HttpClient) {
  }

  public loadTasks(date: moment.Moment): Observable<Task[]> {
    return this.http.get<Task[]>(`${TasksService.url}/${date.format('DD-MM-YYY')}.json`)
      .pipe(map((t) => {
        if (!t) {
          return [];
        }

        const tasks = Object.keys(t).map(key => ({
          ...t[key],
          id: key
        }));
        this.tasksSubject.next(tasks);
        return tasks;
      }));
  }

  public create(task: Task): Observable<Task> {
    const tasks = this.tasksSubject.value;

    return this.http.post<CreateResponse>(`${TasksService.url}/${task.date}.json`, task)
      .pipe(map((res) => {
        const newTask = {
          ...task,
          id: res.name
        };
        // tasks.push(newTask);
        this.tasksSubject.next(tasks);

        return newTask;
      }));
  }

  public remove(task: Task): Observable<any> {
    return this.http.delete<void>(`${TasksService.url}/${task.date}/${task.id}.json`);
  }

  public edit(task: Task): Observable<Task> {
    return this.http.put<any>(`${TasksService.url}/${task.date}/${task.id}.json`, task);
  }

}

import { Component, OnInit } from '@angular/core';
import { DateService } from '../shared/date.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Task, TasksService } from '../shared/tasks.service';
import { switchMap, take } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-organizer',
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss']
})
export class OrganizerComponent implements OnInit {

  public form: FormGroup;
  public tasks: Task[] = [];

  constructor(
    public dateService: DateService,
    public tasksService: TasksService,
  ) {
  }

  public sorting(tasks: Task[], field: string) {
    return tasks.sort((a, b) => (a[field] > b[field]) ? 1 : -1);
  }

  ngOnInit(): void {
    this.dateService.date.pipe(
      switchMap(value => this.tasksService.loadTasks(value))
    ).subscribe(tasks => {
      this.tasks = this.sorting(tasks, 'order');
    });
    this.form = new FormGroup({
      title: new FormControl('', Validators.required)
    })
  }

  public submit() {
    const {title} = this.form.value;
    const task: Task = {
      title,
      order: this.tasks.length + 1,
      date: this.dateService.date.value.format('DD-MM-YYY')
    };
    this.tasksService.create(task).pipe(take(1)).subscribe(task => {
      this.tasks.push(task);
      this.form.reset();
    }, error => {
      console.log(error)
    });
  }

  public removeTask(task: Task) {
    this.tasksService.remove(task).pipe(take(1)).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== task.id)
    });
  }

  public save($event: FocusEvent, task: Task) {
    const title = (<HTMLSpanElement>$event.target).innerText;
    this.tasksService.edit({...task, title}).pipe(take(1)).subscribe()
  }

  public drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
    this.tasks = this.tasks.map((task, index) => ({
      ...task,
      order: index + 1
    }));

    this.tasks = this.sorting(this.tasks, 'order');

    this.tasks.map((task) => {
      this.tasksService.edit({...task, order: task.order}).pipe(take(1)).subscribe()
    });
  }
}

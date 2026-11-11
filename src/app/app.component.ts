import { Component, OnInit } from '@angular/core';
import { airData } from './test.json';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [HttpClientModule, ReactiveFormsModule, FormsModule, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'airport_search';
  userData: any = [];
  airInfo: any = [];
  searchFormControl!: FormControl;
  constructor(private http: HttpClient) {
    this.searchFormControl = new FormControl('');
    this.initiailizeForm();
  }
  ngOnInit(): void {
    this.http.get('/airports.json').subscribe({
      next: (response:any) => {
        this.airInfo = response.map((m: any, id: number) => {
          return {
            ...m,
            id: id,
          };
        });
      },
      error: (error) => {
        console.error(error.name);
      },
    });
  }

  initiailizeForm() {
    this.searchFormControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((v) => v.toLowerCase()?.trim()),
      )
      .subscribe((res) => this.searchAction(res));
  }

  searchAction(value: string | null) {
    if (value) {
      const res = this.airInfo.reduce((acc: any, curr: any) => {
        if (
          curr?.code?.toLowerCase().startsWith(value) ||
          curr?.city?.toLowerCase().startsWith(value)
        ) {
          acc.push(curr);
        }
        return acc;
      }, []);
      if (res) {
      this.userData =  this.getMinValues(res);
      }
    } else {
      this.userData = [];
    }
  }

  getMinValues(info: any) {
    let acc:any = []
    const getMin = info.length >= 5 ? info.length : 5 - info.length;
    if (getMin >= 5) {
      return info.slice(0,5);
    } else {
    this.airInfo.some((curr: any) => {
            // if(!info.includes(curr.code)) {
            //   acc.push(curr);
            // }
            info.some((i:any)=>{
              if(i.id !==curr.id){
                acc.push(curr)
              }
            })
              if(acc?.length == getMin) return acc;   
      });
      return [...info, ...acc];
    }
  }
}

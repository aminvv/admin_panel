// import { Component, Input, OnInit } from '@angular/core';
// import { routes } from '../../../consts';

// @Component({
//   selector: 'app-breadcrumb',
//   templateUrl: './breadcrumb.component.html',
//   styleUrls: ['./breadcrumb.component.scss'],
// })
// export class BreadcrumbComponent implements OnInit {
//   @Input() public path: string;
//   public routes: typeof routes = routes;
//   public pathElements: string[] = [];
//   public lastElement: string;

//   ngOnInit(): void {
//     this.pathElements = this.path.slice(1).split('/');

//     this.lastElement = this.pathElements
//       .pop()
//       .replace(/(^|\s)\S/g, (a: string) => a.toUpperCase());
//   }
// }



import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BREADCRUMB_LABELS } from './const/breadcrumb-persian';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnInit {
  @Input() path: string;

  public segments: string[] = [];
  public labels: string[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // تقسیم مسیر به segment ها
    this.segments = this.path.split('/').filter(seg => seg);

    // تبدیل هر segment به برچسب فارسی
    this.labels = this.segments.map(
      segment => BREADCRUMB_LABELS[segment] ?? segment
    );
  }

  navigate(index: number) {
    const link = '/' + this.segments.slice(0, index + 1).join('/');
    this.router.navigate([link]);
  }
}


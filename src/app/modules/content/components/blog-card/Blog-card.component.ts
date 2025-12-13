import {Component, Input} from '@angular/core';
import {BlogCard} from '../../models';
import {routes} from '../../../../consts';

@Component({
  selector: 'app-blog-card',
  templateUrl: './Blog-card.component.html',
  styleUrls: ['./Blog-card.component.scss']
})
export class BlogCardComponent {
  @Input() blog: BlogCard;
  public routes: typeof routes = routes;
}

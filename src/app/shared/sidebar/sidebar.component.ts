import { Component } from '@angular/core';
import { routes } from '../../consts';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatDialog } from '@angular/material/dialog';
import { ChatPopupComponent } from '../popups/chat-popup/chat-popup.component';


const TREE_DATA: any = [
  {
    name: 'E-commerce',
    children: [
      {name: 'Product Manage', route: routes.MANAGEMENT, active: 'active'},
      {name: 'Products Grid', route: routes.PRODUCTS, active: 'active'},
      {name: 'Product Page', route: routes.PRODUCT, active: 'active'},
    ]
  },

    {
    name: 'Content',
    children: [
      {name: 'Blog Manage', route: routes.MANAGEMENT_BLOG, active: 'active'},
      {name: 'Blogs Grid', route: routes.BLOGS, active: 'active'},
      {name: 'Blog Page', route: routes.BLOG, active: 'active'},
    ]
  },

  {
    name: 'User',
    children: [
      { name: 'User List', route: routes.Users, active: 'active' },
      { name: 'User Add', route: routes.Users_CREATE, active: 'active' },
      { name: 'User Edit', route: routes.Users_EDIT, active: 'active' },
    ]
  }
];

const TemplateNode: any = [

  
  
  {
    name: 'Forms',
    children: [
      { name: 'Form Elements', route: routes.FORMS_ELEMENTS, active: 'active' },
      { name: 'Form Validation', route: routes.FORMS_VALIDATION, active: 'active' },
    ]
  },
  {
    name: 'Charts',
    children: [
      { name: 'Charts Overview', route: routes.OVERVIEW_CHARTS, active: 'active' },
      { name: 'Line Charts', route: routes.LINE_CHARTS, active: 'active' },
      { name: 'Bar Charts', route: routes.BAR_CHARTS, active: 'active' },
      { name: 'Pie Charts', route: routes.PIE_CHARTS, active: 'active' },
    ]
  },
  {
    name: 'Maps',
    children: [
      { name: 'Google Map', route: routes.GOOGLE_MAP, active: 'active' },
      { name: 'Vector Map', route: routes.VECTOR_MAP, active: 'active' }
    ]
  },
  {
    name: 'Extra',
    children: [
      { name: 'Calendar', route: routes.CALENDAR, active: 'active' },
      { name: 'Invoice', route: routes.INVOICE, active: 'active' },

    ]
  },

];


/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  public routes: typeof routes = routes;
  public isOpenUiElements = false;


  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level,
      route: node.route,
      active: node.active
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
    this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  templateDataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);


  constructor(public dialog: MatDialog) {
    this.dataSource.data = TREE_DATA;
    this.templateDataSource.data = TemplateNode;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  public openUiElements() {
    this.isOpenUiElements = !this.isOpenUiElements;
  }

}

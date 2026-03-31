import { Component } from '@angular/core';
import { CrudService } from '../service/crud.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  IsExpertIn:boolean
  IsFournisseurIn:boolean
  IsClientIn:boolean  
 
  constructor(private service:CrudService,private router:Router) { }

  ngOnInit(): void {
    this.IsExpertIn=this.service.isExpertIn();
    this.IsFournisseurIn=this.service.isFournisseurIn();
    this.IsClientIn=this.service.isClientIn();
  }
 

  logout(){
    console.log("logout");
    localStorage.clear()
    this.router.navigate(['/']).then(() => {
      window.location.reload()
    })
    
  }
}

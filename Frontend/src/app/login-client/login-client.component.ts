import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Client } from '../Entites/Client.Entites';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-login-client',
  templateUrl: './login-client.component.html',
  styleUrls: ['./login-client.component.css']
})
export class LoginClientComponent {
   loginForm: FormGroup;
  loginAttempts = 0;
  isLocked = false;
  timeLeft = 15;
  timerInterval: any;

  constructor(
    private fb: FormBuilder,
    private service: CrudService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')
      ]),
      mdp: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$')
      ])
    });
  }

  get email() { return this.loginForm.get('email'); }
  get mdp() { return this.loginForm.get('mdp'); }

  login() {

    if (this.isLocked) {
      Swal.fire({
        icon: 'error',
        title: 'Accès bloqué',
        text: `Attendez ${this.timeLeft} secondes.`
      });
      return;
    }

    if (this.loginForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Champs invalides',
        text: 'Vérifiez email et mot de passe.'
      });
      return;
    }

    const data = this.loginForm.value;

    const client = new Client(
      undefined,
      undefined,
      undefined,
      data.email,
      data.mdp,
      undefined,
      undefined
    );

    this.service.loginClient(client).subscribe({

      next: (res) => {
        localStorage.setItem("myToken", res.token);
        localStorage.setItem("type", "CLIENT");

        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/']).then(() => {
            window.location.reload();
          });
        });
      },

      error: () => {
        this.loginAttempts++;

        if (this.loginAttempts >= 3) {
          this.startTimer();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Email ou mot de passe incorrect',
            text: `Tentative ${this.loginAttempts}/3`
          });
        }
      }
    });
  }

  startTimer() {
    this.isLocked = true;
    this.timeLeft = 15;

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft === 0) {
        clearInterval(this.timerInterval);
        this.isLocked = false;
        this.loginAttempts = 0;
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval)
      clearInterval(this.timerInterval);
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CrudService } from '../service/crud.service';
import { Router } from '@angular/router';
import { ExpertAgricole } from '../Entites/ExpertAgricole.Entites';

@Component({
  selector: 'app-login-expert',
  templateUrl: './login-expert.component.html',
  styleUrls: ['./login-expert.component.css']
})
export class LoginExpertComponent {

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

  startTimer() {
    this.isLocked = true;
    this.timeLeft = 15;

    const timerDialog = Swal.fire({
      title: 'Compte bloqué',
      html: 'Temps restant: <strong></strong> secondes.',
      timer: 15000,
      timerProgressBar: true,
      allowOutsideClick: false,
      didOpen: () => {
        const content = Swal.getHtmlContainer();
        const timerElement = content?.querySelector('strong');

        this.timerInterval = setInterval(() => {
          this.timeLeft--;
          if (timerElement) {
            timerElement.textContent = this.timeLeft.toString();
          }
        }, 1000);
      },
      willClose: () => {
        clearInterval(this.timerInterval);
      }
    }).then(() => {
      this.isLocked = false;
      this.loginAttempts = 0;
    });
  }

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

      let errorMessage = '';

      if (this.email?.errors) {
        if (this.email.errors['required'])
          errorMessage += 'L\'email est requis.\n';
        else if (this.email.errors['pattern'])
          errorMessage += 'L\'email doit se terminer par @gmail.com\n';
      }

      if (this.mdp?.errors) {
        if (this.mdp.errors['required'])
          errorMessage += 'Le mot de passe est requis.\n';
        else if (this.mdp.errors['minlength'])
          errorMessage += 'Minimum 3 caractères.\n';
        else if (this.mdp.errors['pattern'])
          errorMessage += 'Caractères alphanumériques uniquement.\n';
      }

      Swal.fire({
        icon: 'error',
        title: 'Champs invalides',
        text: errorMessage.trim()
      });

      return;
    }

    const data = this.loginForm.value;

    const expert = new ExpertAgricole(
      undefined,
      undefined,
      undefined,
      data.email,
      data.mdp,
      undefined,
      undefined
    );

    this.service.loginExpert(expert).subscribe({

      next: (res) => {
        localStorage.setItem("myTokenExpert", res.token);
        localStorage.setItem("type", "EXPERT");

        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['']).then(() => {
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

  ngOnDestroy() {
    if (this.timerInterval)
      clearInterval(this.timerInterval);
  }
}
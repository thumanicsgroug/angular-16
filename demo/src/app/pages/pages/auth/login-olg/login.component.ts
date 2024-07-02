import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf, KeyValue } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Language } from 'src/app/models/language';
import { LoginService } from './login.service';
import { languagesData } from 'src/app/config/languages-data';

@Component({
  selector: 'vex-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInUp400ms],
  standalone: true,

  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    NgFor,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatCheckboxModule,
    RouterLink,
    MatSnackBarModule,
    MatProgressBarModule,
    MatSelectModule,
    FormsModule
  ]
})

export class LoginComponent {
  formLogin: FormGroup;
  inputType = 'password';
  visible = false;
  selectedLanguage: Language = {}
  mainFrameLoading = false;
  emailverified = false;
  disabled = false;
  successMessage = '';
  errorMessage = '';
  languages: Language[] = [];
  authenticationError: boolean = false;
  date: number = 0;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private loginService: LoginService
  ) {
    this.formLogin = this.fb.group({
      email: ['niang@gmail.com', [Validators.required, Validators.minLength(8), Validators.maxLength(254),
      Validators.email, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['passer123', [Validators.required, Validators.minLength(8)]],
      rememberme: [false],
      preferred_language: ['', Validators.required]
    });
    this.languages = languagesData;
  }



  send(): void {
    this.mainFrameLoading = true;
    this.disabled = true;
    this.loginService.login(this.formLogin.getRawValue()).subscribe(
      (next: any) => {
        let rememberMe = this.formLogin.get('rememberme')?.value;
        console.log(next.status);
        if (next.email_verified == false) {
          this.authenticationError = true;
          this.mainFrameLoading = false;
          this.emailverified = true;
          this.errorMessage = next.message;
          this.cd.detectChanges();

        }else if(next.status == true){ // //email verified is OK with otp
           this.showMessage(next.message);
           this.loginService.LoginSuccess(next.token,rememberMe);
           const dateStartInSeconds = new Date(next.dateStart).getTime() / 1000; // Convert milliseconds to seconds
           const dateEndInSeconds = new Date(next.dateEnd).getTime() / 1000; // Convert milliseconds to seconds
           this.date = dateEndInSeconds - dateStartInSeconds;
           this.mainFrameLoading = false;
          this.disabled = false;
          this.showMessage(next.message);
          this.router.navigate(['/otp-check',{
            email : this.formLogin.get('email')?.value,
            password : this.formLogin.get('password')?.value,
            date: this.date
          }]);
          this.cd.detectChanges();
         }
      },
      (error: any) => {
        //this.mainFrameLoading = true;
        if (error.error.error) { // trop de tentative
          this.showMessage(error.error.error);
          this.cd.detectChanges();

        }else if (error.error.errors) { // email or password incorrect
          this.showMessage(this.displayErrorMessages(error.error.errors));
          this.cd.detectChanges();
          this.disabled = false;

        }else if (error.error.status == false) {
          this.showMessage(error.error.message);
          this.cd.detectChanges();

        }
      }
    );
  }

  resendEmail() {
    this.mainFrameLoading = true;
    let email = this.formLogin.get('email')?.value;
    this.loginService.ResendEmail(email).subscribe(
      (next: any) => {
        this.showMessage(next.message)
        this.mainFrameLoading= false;
        this.emailverified = false;
        this.disabled = false;
        this.cd.detectChanges();
        this.formLogin.reset()
      },
      (error: any) => {
        this.showMessage(error.error.message);
      }
    );
  }
  displayErrorMessages(errors: any) {
    let errorMessage = '';

    // Parcourez les propriétés d'erreurs pour récupérer les messages
    for (const key in errors) {
      if (errors.hasOwnProperty(key)) {
        const messages = errors[key];
        errorMessage += messages.join('\n');
      }
    }
    return errorMessage;
  }

  showMessage(message: string) {
    this.router.navigate(['/']);
    this.snackbar.open(
      message,
      'x',
      {
        duration: 10000
      }
    );
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }
}

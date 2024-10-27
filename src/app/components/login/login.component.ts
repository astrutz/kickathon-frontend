import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, Renderer2 } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { NgClass } from '@angular/common';
import { ToastComponent } from '../reusable/toast/toast.component';

@Component({
  selector: 'kickathon-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, ToastComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginComponent implements OnInit {
  public errors: any;
  private requestService: RequestService = inject(RequestService);
  private _userService: UserService = inject(UserService);
  private router: Router = inject(Router);

  constructor(private renderer: Renderer2) {}

  protected loginForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  formState: 'idle' | 'loading' | 'success' | 'error' = 'idle';

  get name() {
    return this.loginForm.get('name');
  }

  get password() {
    return this.loginForm.get('password');
  }

  ngOnInit(): void {
    const script = this.renderer.createElement('script');
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    script.type = 'module';
    this.renderer.appendChild(document.head, script);
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.valid) {
      this.formState = 'loading';
      try {
        const result = await this.requestService.login(this.loginForm.getRawValue());
        this._userService.setToken(result.jwt);
        this._userService.setCurrentPlayerId(result.id);
        this.formState = 'success';
        this.router.navigate(['']);
      } catch (err: any) {
        this.formState = 'error';
        if (err.response.data.message) {
          this.errors = err.response.data.message;
        } else {
          this.errors = err.toString();
        }
      }
    }
  }
}
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgxOtpInputsComponent } from 'ngx-otp-inputs';

type Dir = 'rtl' | 'ltr';
type Status = 'success' | 'failed' | null;
type InputMode = 'text' | 'numeric' | 'decimal' | 'tel' | 'email';
type InputType = 'number' | 'text' | 'alphanumeric';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxOtpInputsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  length = 6;
  direction: Dir = 'ltr';
  disabled = false;
  inputType: InputType = 'number';
  autoFocus = true;
  inputClass = 'otp-input';
  wrapperClass = 'otp-wrapper';
  readonly = false;
  status: Status = null;

  autoSubmit = true;
  maskInput = false;
  inputMode: InputMode = 'numeric';
  autoBlur = true;
  ariaLabelsCsv = '';

  otpAlive = true;

  form = new FormGroup({
    otp: new FormControl<string>('', [Validators.required]),
  });

  logs: string[] = [];

  @ViewChild('logBox') logBox?: ElementRef<HTMLPreElement>;

  get ariaLabels(): string[] {
    const items = this.ariaLabelsCsv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return items.length
      ? items
      : Array.from({ length: this.length }, (_, i) => `Digit ${i + 1}`);
  }

  onLengthChange(n: number | string) {
    const v = Number(n) || 1;
    this.length = Math.max(1, v);
    this.form.reset();
    this.status = null;
    this.otpAlive = false;
    setTimeout(() => (this.otpAlive = true));
    this.pushLog(`length(${this.length})`);
  }

  ngAfterViewInit(): void {
    this.autoScrollLogs();
  }

  private autoScrollLogs() {
    queueMicrotask(() => {
      const el = this.logBox?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  private pushLog(line: string) {
    this.logs.unshift(line);
    this.autoScrollLogs();
  }

  clearLogs() {
    this.logs = [];
    this.pushLog('logs cleared');
  }

  fillDemo() {
    const code = Array.from({ length: this.length }, () =>
      Math.floor(Math.random() * 10)
    ).join('');
    this.form.patchValue({ otp: code });
    this.status = null;
    this.pushLog(`fillDemo("${code}")`);
  }

  copyValue() {
    const v = this.form.value.otp ?? '';
    if (!v) return;
    navigator.clipboard
      ?.writeText(v)
      .then(() => this.pushLog(`copied("${v}")`));
  }

  onCompleted(code: string) {
    this.status = 'success';
    this.pushLog(`completed("${code}")`);
  }

  onChanged(code: string) {
    if (this.status) this.status = null;
    this.pushLog(`changed("${code}")`);
  }

  submit() {
    if (this.form.valid) {
      const v = this.form.value.otp ?? '';
      this.pushLog(`submit("${v}")`);
    } else {
      this.status = 'failed';
      this.pushLog('submit: form invalid');
    }
  }

  reset() {
    this.form.reset();
    this.status = null;
    this.pushLog('reset()');
  }
}

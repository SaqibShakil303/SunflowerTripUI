import { Component, Input,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-apply-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './apply-form.component.html',
  styleUrl: './apply-form.component.scss'
})
export class ApplyFormComponent  implements OnInit{
  @Input() jobId!: string;
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}
  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      resume: [null, Validators.required],
      coverLetter: ['']
    });
  }

  submit() {
    if (this.form.valid) {
      console.log('Apply for', this.jobId, this.form.value);
      // TODO: send to backend
      alert('Application submitted!');
      this.form.reset();
    }
  }
}

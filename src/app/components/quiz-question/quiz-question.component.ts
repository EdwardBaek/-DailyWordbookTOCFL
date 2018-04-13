import { Component, OnInit, ViewChild } from '@angular/core';
import { Word } from '../../models/Word';
import { Question } from '../../models/Question';
import { QuizService } from '../../services/quiz.service';
import { QuizCardComponent } from '../quiz-card/quiz-card.component';
import { Router, ActivatedRoute } from '@angular/router';
import { QuizScoreComponent } from '../quiz-score/quiz-score.component';

@Component({
  selector: 'app-quiz-question',
  templateUrl: './quiz-question.component.html',
  styleUrls: ['./quiz-question.component.css'],
  styles: [`
    .target { background-color: lightgray; }
  `]
})
export class QuizQuestionComponent implements OnInit {
  isReQuiz: boolean = false;

  words: Word[];
  questions: Question[] = [];

  selectedQuestionIndex: number = 0;
  selectedQuestion: Question;
  selectedAnswereIndex;

  isSelectedAnswerCorrect: boolean = false;
  isCheckAnswer: boolean = false;
  isChangeCardOn: boolean = false;

  @ViewChild(QuizCardComponent) quizCardComponent : QuizCardComponent;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private quizService: QuizService
  ) { 
    this.activatedRoute.parent.params.subscribe(params => {
      if( params.type == 're' )
        this.isReQuiz = true;
    });
  }

  async ngOnInit(){
    if ( this.isReQuiz ) {
      await this.loadReQuiz();
    } else {
      await this.loadQuiz();
    }
  }

  /*** Method ***/
  async loadReQuiz() {
    this.questions = await this.quizService.getReQuestions();
    this.selectedQuestion = this.questions[this.selectedQuestionIndex];
  }
  
  async loadQuiz() {
    this.questions = await this.quizService.getNewQuestions();
    this.selectedQuestion = this.questions[this.selectedQuestionIndex];
  }
  
  /*** UI Method ***/
  onClickNext() {
    this.changeQuestionCard(()=>{
      this.selectedQuestion = this.questions[++this.selectedQuestionIndex];
    });
  }
  onClickScore() {
    this.changeQuestionCard(()=>{
      this.quizService.setQuizResult = this.questions;
      this.router.navigate(['../score'], { relativeTo: this.activatedRoute});
    });
  }

  /*** Private Method ***/
  private changeQuestionCard(callback: Function ) {
    let showAnswerCheckTime = 1000;
    this.changeQuestionStart();
    setTimeout( () => {
      this.changeQuestionEnd();
      callback();
    }, showAnswerCheckTime );
  }
  private changeQuestionStart() {
    this.isChangeCardOn = true;
    this.isCheckAnswer = true;
    this.setSelectedAnswerIndex();
    this.setIsAnswerCorrect();
    this.quizCardComponent.showCheckAnswer();
  }
  private changeQuestionEnd() {
    this.resetStatusAndSelectedData();
    this.quizCardComponent.resetData();
  }
  private resetStatusAndSelectedData() {
    this.isChangeCardOn = false;
    this.isCheckAnswer = false;
    this.isSelectedAnswerCorrect = false;
  }
  private setSelectedAnswerIndex () {
    this.selectedAnswereIndex = this.quizCardComponent.selectedWordIndex;
    if( !this.selectedAnswereIndex )
      this.selectedAnswereIndex = 0;
    this.questions[this.selectedQuestionIndex].selectedWordIndex = this.selectedAnswereIndex;
  }
  private setIsAnswerCorrect() {
    this.isSelectedAnswerCorrect = this.quizCardComponent.isSelectedAnswerCorrect;
    this.questions[this.selectedQuestionIndex].isAnswerCorrect = this.isSelectedAnswerCorrect;
  }
}

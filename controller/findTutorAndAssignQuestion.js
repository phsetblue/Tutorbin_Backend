import { TutorRegisterSchema, QuestionTimingSchema, TutorQuestionsSchema, MainQuestionsSchema } from '../schema/index.js';


const findTutorAndAssignQuestion = async(question) => {
    try {
        console.log(question);
        const tutors = await TutorRegisterSchema.aggregate([
            {
                $match: {
                    isSuspended: false,
                    questionassigned: false
                }
            },
            {
                $lookup: {
                    from: 'TutorSubjects',
                    localField: '_id',
                    foreignField: 'tutorId',
                    as: 'subjects'
                }
            },
            {
                $unwind: '$subjects'
            },
            {
                $unwind: '$subjects.subjects'
            },
            {
                $match: {
                    'subjects.subjects': question.questionSubject
                }
            },
            {
                $lookup: {
                    from: 'TutorTiming',
                    localField: '_id',
                    foreignField: 'tutorId',
                    as: 'timing'
                }
            },
            {
                $unwind: '$timing'
            },
            {
                $project: {
                    _id: 1,
                    screenTime: '$timing.screenTime'
                }
            },
            {
                $sort: {
                    screenTime: -1
                }
            }
        ]);

        console.log('Matching tutors: ', tutors);

        let assignedTutorId;

        if (tutors.length > 0) {
            assignedTutorId = tutors[0]._id;
        } else {
            // If no available tutors are found, get all tutors who are not suspended and sort them by their answer/skipped question ratio
            const allTutors = await TutorRegisterSchema.aggregate([
                {
                    $match: {
                        isSuspended: false
                    }
                },
                {
                    $lookup: {
                        from: 'TutorSubjects',
                        localField: '_id',
                        foreignField: 'tutorId',
                        as: 'subjects'
                    }
                },
                {
                    $unwind: '$subjects'
                },
                {
                    $unwind: '$subjects.subjects'
                },
                {
                    $match: {
                        'subjects.subjects': question.questionSubject
                    }
                },
                {
                    $lookup: {
                        from: 'TutorQuestions',
                        localField: '_id',
                        foreignField: 'tutorId',
                        as: 'questions'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        answeredQuestions: '$questions.stats.answeredQuestions',
                        skippedQuestions: '$questions.stats.skippedQuestions'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        answerSkippedRatio: {
                            $cond: [
                                { $eq: ['$answeredQuestions', 0] },
                                0,
                                {
                                    $cond: [
                                        { $eq: [{ $add: [{ $sum: '$answeredQuestions' }, { $sum: '$skippedQuestions' }] }, 0] },
                                        0,
                                        {
                                            $divide: [
                                                { $sum: '$answeredQuestions' },
                                                { $add: [{ $sum: '$answeredQuestions' }, { $sum: '$skippedQuestions' }] }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }

                    }
                },
                {
                    $sort: {
                        answerSkippedRatio: 1
                    }
                }
            ]);


            console.log('allTutors - ', allTutors);

            // Use a round-robin approach to assign the question to one of the available tutors
            const numTutors = allTutors.length;
            if (numTutors === 0) {
                throw new Error('No tutors available to assign question');
            }

            // Assign the question to the tutor with the highest ratio
            const assignedTutor = allTutors[0];
            assignedTutorId = assignedTutor._id;
        }

        if (assignedTutorId) {
            // Update tutor's questions and screen time
            var timing = await QuestionTimingSchema.findOne({Type: question.questionType});
            var settime = timing.first_time;
            var currentTimePlusExtra = new Date();
            currentTimePlusExtra.setMinutes(currentTimePlusExtra.getMinutes() + parseInt(settime));

            console.log("assignedTutorId - ", assignedTutorId);
            console.log("question - ", question);
            var tutque;
            try {

                tutque = await TutorQuestionsSchema.findOneAndUpdate({ tutorId: assignedTutorId }, {
                    $push: {
                        allQuestions: {
                            questionId: question._id,
                            question: question.question,
                            questionType: question.questionType,
                            questionSubject: question.questionSubject,
                            questionPhoto: question.questionPhoto,
                            tutorPrice: question.tutorPrice,
                            
                        }
                    }
                });
                    // $inc: { 'stats.answeredQuestions': 0, 'stats.skippedQuestions': 0 }
                // }, (error, result) => {
                //     if (error) {
                //         console.log("dsds");
                //         console.error(error);
                //         return;
                //     }
                //     console.log('Array of questions pushed in new:', result);
                // });
                console.log("tutque - ", tutque);
                
            } catch (error) {
                console.log("error in tutques - ", error);
            }
            

            // if(!tutque) {
            //     return false;
            // }

            // Update tutor's question assigned status

            var tutreg;
            try {
                tutreg = await TutorRegisterSchema.findOneAndUpdate({ _id: assignedTutorId }, {
                    $set: { questionassigned: true }
                });
    
                console.log("tutreg - ", tutreg);
                
            } catch (error) {
                console.log("error in tutreg - ", error);
            }
            


            // if(!tutreg) {
            //     return false;
            // }

            var new_mainque;

            try {
                var new_mainque = await MainQuestionsSchema.findByIdAndUpdate( question._id , {
                    internalStatus: "AssignedWithFindResponse",
                    que_timer_end: currentTimePlusExtra
                }, {new: true});
    
                console.log("new_mainque - ", new_mainque);
                
            } catch (error) {
                console.log("error in new_mainque - ", error);
            }
            

            // if(!new_mainque) {
            //     return false;
            // }

            

            return true;

        } else {
            return false;
        }

    }
    catch (error) {
        console.log("error = ", error);
        return false;
    }
}

export { findTutorAndAssignQuestion };
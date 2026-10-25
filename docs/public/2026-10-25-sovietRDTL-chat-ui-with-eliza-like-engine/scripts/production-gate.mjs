import{load,validate,read}from'./catalog.mjs';
const errors=validate(load(),{production:true}),review=read('research/reviews/final-acceptance.json');
if(new Set(review.editorialReviewers.map(r=>r.id)).size<2)errors.push('Two independent editorial reviewers required');
if(review.reviewedReplies<300||review.naturalnessRate<.95||review.topicRelevanceRate<.95)errors.push('300 editorial reply reviews with >=95% naturalness/relevance required');
for(const key of ['rightsReview','semanticDuplicateReview','independentHoldout','mobileVisualReview','coldWarmNetworkReview','mediaDesktopMicrophoneReview','mediaMobileMicrophoneReview'])if(review[key]!=='passed')errors.push(key+' pending');
for(const[name,status]of Object.entries(review.browsers))if(status!=='passed')errors.push(name+' browser acceptance incomplete');
console.log(JSON.stringify({ready:!errors.length,errors},null,2));if(errors.length)process.exitCode=1;

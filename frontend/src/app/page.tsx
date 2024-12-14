'use client'
import './LandingPage.css';

const LandingPage = () => {
  return (
    <>
      <div className="landing-container">
        <header className="landing-header">
          <div className="landing-nav">
            <h1 className="landing-logo">Hero</h1>
            <nav className="landing-nav-buttons">
              <button className="landing-nav-button"><a href="#about-us">About Us</a></button>
              <button className="landing-nav-button"><a href="#forum">Forum</a></button>
              <button className="landing-nav-button"><a href="#quizzes">Quizzes</a></button>
              <button className="landing-nav-button"><a href="#qna">Q&A</a></button>
              <button className="landing-chat-button"><a href="#chatgpt">Chat</a></button>
            </nav>
          </div>
          <div className="landing-header-content">
            <h2 className="landing-title">Welcome to First Aid</h2>
            <p className="landing-subtitle">Your guide to providing emergency medical care</p>
            <button className="landing-button"><a href="/home">Find out more</a></button>
          </div>
        </header>
        <section className="landing-content">
          <div className="landing-feature" id="about-us">
            <div className="landing-image-container">
              <img src="about-us.jpg" alt="About Us" className="landing-image" />
            </div>
            <div className="landing-text">
              <h2>About Us</h2>
              <p>
                  We provide comprehensive guides on first aid to help you in emergencies. 
                  Our mission is to empower individuals with life-saving skills through easy-to-follow guides and practical 
                  training. Founded by passionate healthcare professionals, we are committed to promoting preparedness and 
                  confidence in emergency situations. Join us in creating safer communities where everyone can make a 
                  difference when it matters most.
              </p>
            </div>
          </div>
          <div className="landing-feature" id="forum">
          <div className="landing-image-container">
            <img src="forum.jpg" alt="Forum" className="landing-image" />
          </div>
            <div className="landing-text">
              <h2>Forum</h2>
              <p>Join our community forum to discuss and learn about first aid.</p>
              <p>Whether you're new to first aid or an experienced practitioner, our 
                forum provides a platform for learning, collaboration, and support.</p>
              <button className="landing-button" id="forum-button"><a href="/forum">Join the Discussion</a></button>
            </div>
          </div>
          <div className="landing-feature" id="quizzes">
            <div className="landing-image-container">
              <img src="quiz.jpg" alt="Quizzes" className="landing-image" />
            </div>
            <div className="landing-text">
              <h2>Quizzes</h2>
              <p>Challenge yourself and test your knowledge with our engaging quizzes on first aid. Designed to be interactive and educational, our quizzes cover a variety of topics including CPR, basic wound care, and emergency response.</p>
              <p>Each quiz provides instant feedback so you can learn as you go. Track your progress and see how well-prepared you are to handle emergencies.</p>
              <button className="landing-button" id="quiz-button"><a href="/quiz">Start Quiz</a></button>
            </div>
          </div>
          <div className="landing-feature" id="qna">
          <div className="landing-image-container">
            <img src="qna.jpg" alt="Q&A" className="landing-image" />
          </div>
          <div className="landing-text">
            <h2>Q&A</h2>
            <p>Our Q&A section is your gateway to expert advice on first aid and emergency medical care. Whether you have specific questions about CPR techniques, wound management, or general emergency preparedness, our community of medical professionals is here to provide accurate and timely answers.</p>
            <p>Engage in discussions, share your experiences, and learn from the expertise of healthcare providers dedicated to promoting safety and well-being in our communities.</p>
            <button className="landing-button" id="qna-button"><a href="/qna">Ask a Question</a></button>
          </div>
          </div>
          <div id="chatgpt" className="landing-feature">
            <div className="landing-image-container">
              <img src="chat.jpg" alt="ChatGPT Help" className="landing-image" />
            </div>
            <div className="landing-text">
              <h2>ChatGPT Help</h2>
              <p>Get instant help from ChatGPT for your first aid inquiries. Our AI-powered assistant is available 24/7 to provide accurate information and guidance whenever you need it.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default LandingPage;

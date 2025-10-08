import Image from 'next/image';
import "./scope-preview.css";

export default function ScopePreview() {

    return (
      <div className="course-preview-section">

        <h3 className="course-preview-title">What you'll learn:</h3>

        <div className="course-preview-grid">

          <div className="course-preview-item">
            <div className="course-preview-icon">
              <Image src="/images/icon-alphabet.svg" alt="Georgian Alphabet" width={38} height={38} />
            </div>
            <div className="course-preview-content">
              <div className="course-preview-name">Alphabet</div>
            </div>
          </div>
          
          <div className="course-preview-item">
            <div className="course-preview-icon">
              <Image src="/images/icon-numbers.svg" alt="Georgian Numbers" width={38} height={38} />
            </div>
            <div className="course-preview-content">
              <div className="course-preview-name">Numbers</div>
            </div>
          </div>
          
          <div className="course-preview-item">
            <div className="course-preview-icon">
              <Image src="/images/icon-phrases.svg" alt="Georgian Words" width={38} height={38} />
            </div>
            <div className="course-preview-content">
              <div className="course-preview-name">Words</div>
            </div>
          </div>
          
          <div className="course-preview-item">
            <div className="course-preview-icon">
              <Image src="/images/icon-phrases.svg" alt="Georgian Sentences" width={38} height={38} />
            </div>
            <div className="course-preview-content">
              <div className="course-preview-name">Sentences</div>
            </div>
          </div>

        </div>

      </div>
    )

}
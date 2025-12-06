import Image from 'next/image';
import "./scope-preview.css";

export default function ScopePreview() {

  return (
    <div className="levels-preview-section">

      <h3 className="levels-preview-title">What you'll learn:</h3>

      <div className="levels-preview-list">

        <div className="levels-preview-item">
          <div className="levels-preview-icon">
            <Image src="/images/icon-alphabet.svg" alt="Georgian Alphabet" width={38} height={38} />
          </div>
          <div className="levels-preview-content">
            <div className="levels-preview-name">Alphabet</div>
          </div>
        </div>

        <div className="levels-preview-divider"></div>

        <div className="levels-preview-item">
          <div className="levels-preview-icon">
            <Image src="/images/icon-numbers.svg" alt="Georgian Numbers" width={38} height={38} />
          </div>
          <div className="levels-preview-content">
            <div className="levels-preview-name">Numbers</div>
          </div>
        </div>

        <div className="levels-preview-divider"></div>

        <div className="levels-preview-item">
          <div className="levels-preview-icon">
            <Image src="/images/icon-phrases.svg" alt="Georgian Words" width={38} height={38} />
          </div>
          <div className="levels-preview-content">
            <div className="levels-preview-name">Words</div>
          </div>
        </div>

        <div className="levels-preview-divider"></div>

        <div className="levels-preview-item">
          <div className="levels-preview-icon">
            <Image src="/images/icon-phrases.svg" alt="Georgian Sentences" width={38} height={38} />
          </div>
          <div className="levels-preview-content">
            <div className="levels-preview-name">Sentences</div>
          </div>
        </div>

      </div>

    </div>
  )

}
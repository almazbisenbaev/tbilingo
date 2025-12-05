import Image from 'next/image';
import "./scope-preview.css";

export default function ScopePreview() {

  return (
    <div className="level-preview-section">

      <h3 className="level-preview-title">What you'll learn:</h3>

      <div className="level-preview-grid">

        <div className="level-preview-item">
          <div className="level-preview-icon">
            <Image src="/images/icon-alphabet.svg" alt="Georgian Alphabet" width={38} height={38} />
          </div>
          <div className="level-preview-content">
            <div className="level-preview-name">Alphabet</div>
          </div>
        </div>

        <div className="level-preview-item">
          <div className="level-preview-icon">
            <Image src="/images/icon-numbers.svg" alt="Georgian Numbers" width={38} height={38} />
          </div>
          <div className="level-preview-content">
            <div className="level-preview-name">Numbers</div>
          </div>
        </div>

        <div className="level-preview-item">
          <div className="level-preview-icon">
            <Image src="/images/icon-phrases.svg" alt="Georgian Words" width={38} height={38} />
          </div>
          <div className="level-preview-content">
            <div className="level-preview-name">Words</div>
          </div>
        </div>

        <div className="level-preview-item">
          <div className="level-preview-icon">
            <Image src="/images/icon-phrases.svg" alt="Georgian Sentences" width={38} height={38} />
          </div>
          <div className="level-preview-content">
            <div className="level-preview-name">Sentences</div>
          </div>
        </div>

      </div>

    </div>
  )

}